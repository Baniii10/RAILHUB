CREATE OR REPLACE FUNCTION public.search_train_schedules(
    p_origin_code TEXT,
    p_destination_code TEXT,
    p_departure_date DATE,
    p_passengers INTEGER DEFAULT 1
)
RETURNS TABLE (
    schedule_id UUID,
    departure_time TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    status TEXT,
    train_name TEXT,
    train_number TEXT,
    route_name TEXT,
    distance_km NUMERIC,
    origin_code TEXT,
    origin_name TEXT,
    origin_city TEXT,
    destination_code TEXT,
    destination_name TEXT,
    destination_city TEXT,
    carriage_class TEXT,
    price NUMERIC,
    available_seats BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF p_origin_code IS NULL OR p_destination_code IS NULL
       OR p_origin_code = p_destination_code
       OR p_departure_date IS NULL
       OR p_passengers IS NULL OR p_passengers < 1 OR p_passengers > 6 THEN
        RAISE EXCEPTION 'Invalid train search parameters.';
    END IF;

    RETURN QUERY
    SELECT
        sch.id,
        sch.departure_time,
        sch.arrival_time,
        sch.status::TEXT,
        tr.name::TEXT,
        tr.train_number::TEXT,
        r.name::TEXT,
        r.distance_km,
        origin.code::TEXT,
        origin.name::TEXT,
        origin.city::TEXT,
        destination.code::TEXT,
        destination.name::TEXT,
        destination.city::TEXT,
        fare.carriage_class::TEXT,
        fare.price,
        COUNT(seat.id) FILTER (
            WHERE booking.id IS NULL
               OR booking.status NOT IN ('pending', 'paid')
               OR (booking.status = 'pending' AND booking.expires_at <= now())
        )
    FROM public.schedules sch
    JOIN public.trains tr ON tr.id = sch.train_id
    JOIN public.routes r ON r.id = sch.route_id
    JOIN public.stations origin ON origin.id = r.origin_station_id
    JOIN public.stations destination ON destination.id = r.destination_station_id
    JOIN public.fares fare ON fare.schedule_id = sch.id
    JOIN public.carriages carriage
      ON carriage.train_id = tr.id
     AND carriage.carriage_class = fare.carriage_class
    JOIN public.seats seat ON seat.carriage_id = carriage.id
    LEFT JOIN public.booking_seats booking_seat
      ON booking_seat.schedule_id = sch.id
     AND booking_seat.seat_id = seat.id
    LEFT JOIN public.bookings booking ON booking.id = booking_seat.booking_id
    WHERE origin.code = p_origin_code
      AND destination.code = p_destination_code
      AND sch.departure_time >= (p_departure_date::TIMESTAMP AT TIME ZONE 'Asia/Jakarta')
      AND sch.departure_time < ((p_departure_date + 1)::TIMESTAMP AT TIME ZONE 'Asia/Jakarta')
      AND sch.status <> 'cancelled'
      AND sch.departure_time > now()
    GROUP BY
        sch.id, sch.departure_time, sch.arrival_time, sch.status,
        tr.name, tr.train_number, r.name, r.distance_km,
        origin.code, origin.name, origin.city,
        destination.code, destination.name, destination.city,
        fare.carriage_class, fare.price
    HAVING COUNT(seat.id) FILTER (
        WHERE booking.id IS NULL
           OR booking.status NOT IN ('pending', 'paid')
           OR (booking.status = 'pending' AND booking.expires_at <= now())
    ) >= p_passengers
    ORDER BY sch.departure_time, fare.price;
END;
$$;

REVOKE ALL ON FUNCTION public.search_train_schedules(TEXT, TEXT, DATE, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_train_schedules(TEXT, TEXT, DATE, INTEGER) TO anon, authenticated;
