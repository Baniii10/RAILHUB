ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS reschedule_fee NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (reschedule_fee >= 0),
    ADD COLUMN IF NOT EXISTS cancellation_fee NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (cancellation_fee >= 0),
    ADD COLUMN IF NOT EXISTS ticket_fare_amount NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (ticket_fare_amount >= 0);

UPDATE public.bookings
SET ticket_fare_amount = total_amount
WHERE status = 'paid'
  AND ticket_fare_amount = 0;

ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (refunded_amount >= 0);

CREATE OR REPLACE FUNCTION public.reschedule_own_paid_booking(
    p_booking_id UUID,
    p_schedule_id UUID,
    p_seat_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_old_schedule_id UUID;
    v_old_route_id UUID;
    v_old_departure TIMESTAMPTZ;
    v_old_total NUMERIC(12, 2);
    v_old_fare_total NUMERIC(12, 2);
    v_passenger_count INTEGER;
    v_class_count INTEGER;
    v_carriage_class TEXT;
    v_target_route_id UUID;
    v_target_train_id UUID;
    v_target_departure TIMESTAMPTZ;
    v_fare NUMERIC(12, 2);
    v_new_fare_total NUMERIC(12, 2);
    v_fare_difference NUMERIC(12, 2);
    v_reschedule_fee NUMERIC(12, 2);
    v_new_total NUMERIC(12, 2);
    v_locked_seats INTEGER;
BEGIN
    IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'passenger' THEN
        RAISE EXCEPTION 'Only authenticated passengers can reschedule tickets.';
    END IF;

    PERFORM 1
    FROM public.bookings booking
    WHERE booking.id = p_booking_id
      AND booking.user_id = auth.uid()
      AND booking.status = 'paid'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Paid booking not found.';
    END IF;

    SELECT booking.schedule_id, schedule.route_id, schedule.departure_time,
           booking.total_amount,
           COALESCE(NULLIF(booking.ticket_fare_amount, 0), booking.total_amount),
           count(booking_seat.passenger_id),
           count(DISTINCT carriage.carriage_class),
           min(carriage.carriage_class::TEXT)
    INTO v_old_schedule_id, v_old_route_id, v_old_departure, v_old_total, v_old_fare_total,
         v_passenger_count, v_class_count, v_carriage_class
    FROM public.bookings booking
    JOIN public.schedules schedule ON schedule.id = booking.schedule_id
    JOIN public.booking_seats booking_seat ON booking_seat.booking_id = booking.id
    JOIN public.seats seat ON seat.id = booking_seat.seat_id
    JOIN public.carriages carriage ON carriage.id = seat.carriage_id
    WHERE booking.id = p_booking_id
      AND booking.user_id = auth.uid()
      AND booking.status = 'paid'
    GROUP BY booking.schedule_id, schedule.route_id, schedule.departure_time,
             booking.total_amount, booking.ticket_fare_amount;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Paid booking not found.';
    END IF;

    PERFORM 1
    FROM public.payments payment
    WHERE payment.booking_id = p_booking_id
      AND payment.status = 'confirmed'
      AND payment.amount = v_old_total
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'The confirmed payment record is missing or inconsistent.';
    END IF;

    IF v_class_count <> 1 OR v_passenger_count < 1
       OR p_schedule_id IS NULL OR p_schedule_id = v_old_schedule_id
       OR cardinality(p_seat_ids) IS DISTINCT FROM v_passenger_count
       OR cardinality(p_seat_ids) <> (
           SELECT count(DISTINCT selected.selected_seat)
           FROM unnest(p_seat_ids) AS selected(selected_seat)
       ) THEN
        RAISE EXCEPTION 'Select a different schedule and one unique seat per passenger in the original class.';
    END IF;

    IF v_old_departure <= now() + INTERVAL '24 hours' THEN
        RAISE EXCEPTION 'Tickets can only be rescheduled at least 24 hours before departure.';
    END IF;

    SELECT schedule.route_id, schedule.train_id, schedule.departure_time, fare.price
    INTO v_target_route_id, v_target_train_id, v_target_departure, v_fare
    FROM public.schedules schedule
    JOIN public.fares fare
      ON fare.schedule_id = schedule.id
     AND fare.carriage_class::TEXT = v_carriage_class
    WHERE schedule.id = p_schedule_id
      AND schedule.status IN ('scheduled', 'boarding', 'delayed')
      AND schedule.departure_time > now() + INTERVAL '24 hours'
    FOR UPDATE OF schedule, fare;

    IF NOT FOUND OR v_target_route_id IS DISTINCT FROM v_old_route_id THEN
        RAISE EXCEPTION 'Choose an available schedule on the same route, at least 24 hours before departure.';
    END IF;

    PERFORM seat.id
    FROM public.seats seat
    JOIN public.carriages carriage ON carriage.id = seat.carriage_id
    WHERE carriage.train_id = v_target_train_id
      AND carriage.carriage_class::TEXT = v_carriage_class
      AND seat.id = ANY(p_seat_ids)
    FOR UPDATE OF seat;

    GET DIAGNOSTICS v_locked_seats = ROW_COUNT;
    IF v_locked_seats <> v_passenger_count THEN
        RAISE EXCEPTION 'One or more selected seats do not belong to the target schedule and class.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.booking_seats booking_seat
        JOIN public.bookings booking ON booking.id = booking_seat.booking_id
        WHERE booking_seat.schedule_id = p_schedule_id
          AND booking_seat.seat_id = ANY(p_seat_ids)
          AND booking.id <> p_booking_id
          AND (
              booking.status = 'paid'
              OR (booking.status = 'pending' AND booking.expires_at > now())
          )
    ) THEN
        RAISE EXCEPTION 'One or more selected seats have already been booked.';
    END IF;

    DELETE FROM public.booking_seats booking_seat
    USING public.bookings booking
    WHERE booking.id = booking_seat.booking_id
      AND booking_seat.schedule_id = p_schedule_id
      AND booking_seat.seat_id = ANY(p_seat_ids)
      AND booking.id <> p_booking_id
      AND (
          booking.status IN ('expired', 'cancelled')
          OR (booking.status = 'pending' AND booking.expires_at <= now())
      );

    v_new_fare_total := v_fare * v_passenger_count;
    v_fare_difference := greatest(v_new_fare_total - v_old_fare_total, 0);
    v_reschedule_fee := round(v_fare_difference * 0.20, 2);
    v_new_total := v_old_total + v_fare_difference + v_reschedule_fee;

    WITH passenger_order AS (
        SELECT booking_seat.passenger_id,
               row_number() OVER (ORDER BY booking_seat.passenger_id) AS seat_order
        FROM public.booking_seats booking_seat
        WHERE booking_seat.booking_id = p_booking_id
    ), selected_seats AS (
        SELECT selected_seat AS seat_id, ordinality AS seat_order
        FROM unnest(p_seat_ids) WITH ORDINALITY AS selected(selected_seat, ordinality)
    )
    UPDATE public.booking_seats booking_seat
    SET schedule_id = p_schedule_id,
        seat_id = selected_seats.seat_id
    FROM passenger_order, selected_seats
    WHERE booking_seat.booking_id = p_booking_id
      AND booking_seat.passenger_id = passenger_order.passenger_id
      AND passenger_order.seat_order = selected_seats.seat_order;

    WITH passenger_order AS (
        SELECT booking_seat.passenger_id,
               row_number() OVER (ORDER BY booking_seat.passenger_id) AS seat_order
        FROM public.booking_seats booking_seat
        WHERE booking_seat.booking_id = p_booking_id
    ), selected_seats AS (
        SELECT selected_seat AS seat_id, ordinality AS seat_order
        FROM unnest(p_seat_ids) WITH ORDINALITY AS selected(selected_seat, ordinality)
    )
    UPDATE public.tickets ticket
    SET schedule_id = p_schedule_id,
        seat_id = selected_seats.seat_id
    FROM passenger_order, selected_seats
    WHERE ticket.booking_id = p_booking_id
      AND ticket.passenger_id = passenger_order.passenger_id
      AND passenger_order.seat_order = selected_seats.seat_order;

    WITH passenger_order AS (
        SELECT booking_seat.passenger_id,
               row_number() OVER (ORDER BY booking_seat.passenger_id) AS seat_order
        FROM public.booking_seats booking_seat
        WHERE booking_seat.booking_id = p_booking_id
    ), selected_seats AS (
        SELECT selected_seat AS seat_id, ordinality AS seat_order
        FROM unnest(p_seat_ids) WITH ORDINALITY AS selected(selected_seat, ordinality)
    )
    UPDATE public.food_orders food_order
    SET schedule_id = p_schedule_id,
        seat_id = selected_seats.seat_id,
        updated_at = now()
    FROM passenger_order, selected_seats
    WHERE food_order.booking_id = p_booking_id
      AND food_order.passenger_id = passenger_order.passenger_id
      AND passenger_order.seat_order = selected_seats.seat_order
      AND food_order.status NOT IN ('completed', 'cancelled');

    UPDATE public.bookings
    SET     schedule_id = p_schedule_id,
    total_amount = v_new_total,
    reschedule_fee = v_reschedule_fee,
    ticket_fare_amount = v_new_fare_total,
    updated_at = now()
    WHERE id = p_booking_id;

    UPDATE public.payments
    SET amount = v_new_total,
        updated_at = now()
    WHERE booking_id = p_booking_id
      AND status = 'confirmed';

    RETURN jsonb_build_object(
        'total_amount', v_new_total,
        'fare_difference', v_fare_difference,
        'reschedule_fee', v_reschedule_fee,
        'additional_amount', v_fare_difference + v_reschedule_fee
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_own_paid_booking(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_total NUMERIC(12, 2);
    v_departure TIMESTAMPTZ;
    v_cancellation_fee NUMERIC(12, 2);
    v_refund NUMERIC(12, 2);
BEGIN
    IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'passenger' THEN
        RAISE EXCEPTION 'Only authenticated passengers can cancel paid bookings.';
    END IF;

    SELECT booking.total_amount, schedule.departure_time
    INTO v_total, v_departure
    FROM public.bookings booking
    JOIN public.schedules schedule ON schedule.id = booking.schedule_id
    WHERE booking.id = p_booking_id
      AND booking.user_id = auth.uid()
      AND booking.status = 'paid'
    FOR UPDATE OF booking;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Paid booking not found.';
    END IF;

    PERFORM 1
    FROM public.payments payment
    WHERE payment.booking_id = p_booking_id
      AND payment.status = 'confirmed'
      AND payment.amount = v_total
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'The confirmed payment record is missing or inconsistent.';
    END IF;

    IF v_departure <= now() + INTERVAL '24 hours' THEN
        RAISE EXCEPTION 'Paid bookings can only be cancelled at least 24 hours before departure.';
    END IF;

    v_cancellation_fee := round(v_total * 0.20, 2);
    v_refund := v_total - v_cancellation_fee;

    UPDATE public.bookings
    SET status = 'cancelled',
        cancellation_fee = v_cancellation_fee,
        updated_at = now()
    WHERE id = p_booking_id;

    UPDATE public.payments
    SET status = 'refunded',
        refunded_amount = v_refund,
        updated_at = now()
    WHERE booking_id = p_booking_id
      AND status = 'confirmed';

    UPDATE public.food_orders
    SET status = 'cancelled', updated_at = now()
    WHERE booking_id = p_booking_id
      AND status NOT IN ('completed', 'cancelled');

    DELETE FROM public.tickets WHERE booking_id = p_booking_id;
    DELETE FROM public.booking_seats WHERE booking_id = p_booking_id;

    RETURN jsonb_build_object(
        'cancellation_fee', v_cancellation_fee,
        'refund_amount', v_refund
    );
END;
$$;

REVOKE ALL ON FUNCTION public.reschedule_own_paid_booking(UUID, UUID, UUID[])
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reschedule_own_paid_booking(UUID, UUID, UUID[])
    TO authenticated;
REVOKE ALL ON FUNCTION public.cancel_own_paid_booking(UUID)
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_own_paid_booking(UUID)
    TO authenticated;
