CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone_number, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, 'user-' || NEW.id::TEXT || '@invalid.local'),
        COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), 'Penumpang'),
        NULLIF(trim(NEW.raw_user_meta_data ->> 'phone_number'), ''),
        'passenger'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_railhub_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_railhub_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;

INSERT INTO public.profiles (id, email, full_name, phone_number, role)
SELECT
    auth_user.id,
    COALESCE(auth_user.email, 'user-' || auth_user.id::TEXT || '@invalid.local'),
    COALESCE(NULLIF(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''), 'Penumpang'),
    NULLIF(trim(auth_user.raw_user_meta_data ->> 'phone_number'), ''),
    'passenger'
FROM auth.users auth_user
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles profile WHERE profile.id = auth_user.id
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    method TEXT NOT NULL DEFAULT 'simulation'
        CHECK (method IN ('simulation', 'bank_transfer', 'e_wallet', 'virtual_account', 'qr_payment')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded', 'cancelled')),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payments FROM anon, authenticated;
GRANT SELECT ON public.payments TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.bookings, public.passengers,
    public.booking_seats, public.tickets FROM anon, authenticated;
GRANT SELECT ON public.bookings, public.passengers, public.booking_seats,
    public.tickets TO authenticated;

DROP POLICY IF EXISTS "Users read own payments" ON public.payments;
CREATE POLICY "Users read own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = payments.booking_id
              AND (b.user_id = auth.uid() OR public.is_admin())
        )
    );

REVOKE ALL ON FUNCTION public.create_booking_atomic(
    UUID, UUID, UUID[], TEXT[], TEXT[], TEXT[], NUMERIC, VARCHAR
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.confirm_payment_and_issue_tickets(UUID)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_ticket_single_use(VARCHAR, UUID)
    FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_schedule_booking_data(p_schedule_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT jsonb_build_object(
        'schedule', jsonb_build_object(
            'id', sch.id,
            'departure_time', sch.departure_time,
            'arrival_time', sch.arrival_time,
            'status', sch.status,
            'train_name', tr.name,
            'train_number', tr.train_number,
            'route_name', r.name,
            'origin_name', origin.name,
            'origin_code', origin.code,
            'destination_name', destination.name,
            'destination_code', destination.code
        ),
        'fares', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'carriage_class', fare.carriage_class,
                'price', fare.price
            ) ORDER BY fare.price)
            FROM public.fares fare
            WHERE fare.schedule_id = sch.id
        ), '[]'::jsonb),
        'seats', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id', seat.id,
                'seat_number', seat.seat_number,
                'carriage_id', carriage.id,
                'carriage_number', carriage.carriage_number,
                'carriage_class', carriage.carriage_class,
                'is_available', NOT EXISTS (
                    SELECT 1
                    FROM public.booking_seats bs
                    JOIN public.bookings b ON b.id = bs.booking_id
                    WHERE bs.schedule_id = sch.id
                      AND bs.seat_id = seat.id
                      AND (
                          b.status = 'paid'
                          OR (b.status = 'pending' AND b.expires_at > now())
                      )
                )
            ) ORDER BY carriage.carriage_number, seat.seat_number)
            FROM public.carriages carriage
            JOIN public.seats seat ON seat.carriage_id = carriage.id
            WHERE carriage.train_id = tr.id
        ), '[]'::jsonb)
    )
    FROM public.schedules sch
    JOIN public.trains tr ON tr.id = sch.train_id
    JOIN public.routes r ON r.id = sch.route_id
    JOIN public.stations origin ON origin.id = r.origin_station_id
    JOIN public.stations destination ON destination.id = r.destination_station_id
    WHERE sch.id = p_schedule_id
      AND sch.departure_time > now()
      AND sch.status IN ('scheduled', 'boarding', 'delayed');
$$;

CREATE OR REPLACE FUNCTION public.create_booking_for_current_user(
    p_schedule_id UUID,
    p_carriage_class TEXT,
    p_seat_ids UUID[],
    p_passenger_names TEXT[],
    p_passenger_ids TEXT[],
    p_passenger_phones TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_booking_id UUID;
    v_price NUMERIC(12, 2);
    v_count INTEGER;
    v_inserted INTEGER;
    v_index INTEGER;
    v_passenger_id UUID;
BEGIN
    IF v_user_id IS NULL OR public.current_user_role() IS DISTINCT FROM 'passenger' THEN
        RAISE EXCEPTION 'Only authenticated passengers can create bookings.';
    END IF;

    v_count := COALESCE(array_length(p_seat_ids, 1), 0);
    IF v_count < 1 OR v_count > 6
       OR array_length(p_passenger_names, 1) IS DISTINCT FROM v_count
       OR array_length(p_passenger_ids, 1) IS DISTINCT FROM v_count
       OR array_length(p_passenger_phones, 1) IS DISTINCT FROM v_count
       OR cardinality(p_seat_ids) <> (SELECT count(DISTINCT value) FROM unnest(p_seat_ids) AS seats(value)) THEN
        RAISE EXCEPTION 'Provide between one and six unique seats and matching passenger details.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM generate_subscripts(p_passenger_names, 1) idx
        WHERE p_passenger_names[idx] IS NULL
           OR p_passenger_ids[idx] IS NULL
           OR length(trim(p_passenger_names[idx])) NOT BETWEEN 2 AND 120
           OR length(trim(p_passenger_ids[idx])) NOT BETWEEN 3 AND 50
           OR (p_passenger_phones[idx] IS NOT NULL AND length(trim(p_passenger_phones[idx])) > 30)
    ) THEN
        RAISE EXCEPTION 'Passenger details are invalid.';
    END IF;

    SELECT fare.price INTO v_price
    FROM public.schedules sch
    JOIN public.fares fare ON fare.schedule_id = sch.id
    WHERE sch.id = p_schedule_id
      AND fare.carriage_class::TEXT = p_carriage_class
      AND sch.departure_time > now()
      AND sch.status IN ('scheduled', 'boarding', 'delayed')
    FOR SHARE OF sch, fare;

    IF v_price IS NULL THEN
        RAISE EXCEPTION 'The selected schedule or fare is no longer available.';
    END IF;

    UPDATE public.bookings
    SET status = 'expired', updated_at = now()
    WHERE status = 'pending' AND expires_at <= now();

    UPDATE public.payments payment
    SET status = 'cancelled', updated_at = now()
    FROM public.bookings booking
    WHERE payment.booking_id = booking.id
      AND booking.status = 'expired'
      AND payment.status = 'pending';

    DELETE FROM public.booking_seats bs
    USING public.bookings b
    WHERE b.id = bs.booking_id
      AND b.status IN ('expired', 'cancelled');

    PERFORM seat.id
    FROM public.seats seat
    JOIN public.carriages carriage ON carriage.id = seat.carriage_id
    JOIN public.schedules sch ON sch.train_id = carriage.train_id
    WHERE sch.id = p_schedule_id
      AND carriage.carriage_class::TEXT = p_carriage_class
      AND seat.id = ANY(p_seat_ids)
    FOR UPDATE OF seat;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    IF v_inserted <> v_count THEN
        RAISE EXCEPTION 'One or more selected seats do not belong to this schedule and class.';
    END IF;

    INSERT INTO public.bookings (
        booking_code, user_id, schedule_id, total_amount, status, expires_at
    ) VALUES (
        'RH-' || upper(substr(replace(gen_random_uuid()::TEXT, '-', ''), 1, 10)),
        v_user_id,
        p_schedule_id,
        v_price * v_count,
        'pending',
        now() + INTERVAL '15 minutes'
    ) RETURNING id INTO v_booking_id;

    FOR v_index IN 1..v_count LOOP
        BEGIN
            INSERT INTO public.passengers (booking_id, full_name, id_card_number, phone_number)
            VALUES (
                v_booking_id,
                trim(p_passenger_names[v_index]),
                trim(p_passenger_ids[v_index]),
                NULLIF(trim(p_passenger_phones[v_index]), '')
            ) RETURNING id INTO v_passenger_id;

            INSERT INTO public.booking_seats (booking_id, schedule_id, seat_id, passenger_id)
            VALUES (v_booking_id, p_schedule_id, p_seat_ids[v_index], v_passenger_id);
        EXCEPTION WHEN unique_violation THEN
            RAISE EXCEPTION 'ERR_SEAT_ALREADY_BOOKED: One or more selected seats have just been booked.';
        END;
    END LOOP;

    INSERT INTO public.payments (booking_id, amount, method, status)
    VALUES (v_booking_id, v_price * v_count, 'simulation', 'pending');

    RETURN v_booking_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.simulate_booking_payment(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_booking public.bookings%ROWTYPE;
    v_payment public.payments%ROWTYPE;
    v_seat RECORD;
    v_ticket_count INTEGER := 0;
BEGIN
    IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'passenger' THEN
        RAISE EXCEPTION 'Only the authenticated passenger can pay for this booking.';
    END IF;

    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id AND user_id = auth.uid()
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found.';
    END IF;

    IF v_booking.status = 'paid' THEN
        RETURN;
    END IF;

    IF v_booking.status <> 'pending' OR v_booking.expires_at <= now() THEN
        RAISE EXCEPTION 'This booking is no longer payable.';
    END IF;

    SELECT * INTO v_payment
    FROM public.payments
    WHERE booking_id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND OR v_payment.status <> 'pending'
       OR v_payment.amount <> v_booking.total_amount THEN
        RAISE EXCEPTION 'Payment record is missing or inconsistent.';
    END IF;

    SELECT count(*) INTO v_ticket_count
    FROM public.booking_seats
    WHERE booking_id = p_booking_id;

    IF v_ticket_count = 0 THEN
        RAISE EXCEPTION 'Booking has no allocated passengers or seats.';
    END IF;

    UPDATE public.payments
    SET status = 'confirmed', confirmed_at = now(), updated_at = now()
    WHERE id = v_payment.id;

    UPDATE public.bookings
    SET status = 'paid', payment_simulated_at = now(), updated_at = now()
    WHERE id = p_booking_id;

    FOR v_seat IN
        SELECT bs.passenger_id, bs.schedule_id, bs.seat_id
        FROM public.booking_seats bs
        WHERE bs.booking_id = p_booking_id
    LOOP
        INSERT INTO public.tickets (
            ticket_number, booking_id, passenger_id, schedule_id, seat_id
        ) VALUES (
            'TKT-' || upper(replace(gen_random_uuid()::TEXT, '-', '')),
            p_booking_id, v_seat.passenger_id, v_seat.schedule_id, v_seat.seat_id
        );
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_own_pending_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'passenger' THEN
        RAISE EXCEPTION 'Only authenticated passengers can cancel their bookings.';
    END IF;

    UPDATE public.bookings
    SET status = 'cancelled', updated_at = now()
    WHERE id = p_booking_id
      AND user_id = auth.uid()
      AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Only your pending bookings can be cancelled.';
    END IF;

    UPDATE public.payments
    SET status = 'cancelled', updated_at = now()
    WHERE booking_id = p_booking_id AND status = 'pending';

    DELETE FROM public.booking_seats WHERE booking_id = p_booking_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_schedule_booking_data(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_schedule_booking_data(UUID) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.create_booking_for_current_user(UUID, TEXT, UUID[], TEXT[], TEXT[], TEXT[])
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_booking_for_current_user(UUID, TEXT, UUID[], TEXT[], TEXT[], TEXT[])
    TO authenticated;
REVOKE ALL ON FUNCTION public.simulate_booking_payment(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.simulate_booking_payment(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.cancel_own_pending_booking(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_own_pending_booking(UUID) TO authenticated;
