-- ============================================================================
-- RAILHUB COMPLETE PRODUCTION PATCH (SUPABASE DATABASE)
-- Jalankan skrip ini langsung di Supabase SQL Editor (Dashboard -> SQL Editor)
-- atau via Supabase CLI (npx supabase db push).
-- Script ini bersifat IDEMPOTENT (aman dijalankan berulang kali).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. EXTEND BOOKINGS & PAYMENTS COLUMNS (Untuk Reschedule & Pembatalan Tiket)
-- ----------------------------------------------------------------------------
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS reschedule_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cancellation_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ticket_fare_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;

UPDATE public.bookings
SET ticket_fare_amount = total_amount
WHERE ticket_fare_amount = 0 AND total_amount > 0;

ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- ----------------------------------------------------------------------------
-- 2. EXTEND PROFILES FOR STATION & GATE STAFF
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS staff_type TEXT,
    ADD COLUMN IF NOT EXISTS station_id UUID REFERENCES public.stations(id) ON DELETE SET NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_staff_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_staff_type_check
    CHECK (staff_type IS NULL OR staff_type IN ('gate', 'conductor'));

CREATE INDEX IF NOT EXISTS idx_profiles_station_id ON public.profiles(station_id);

-- ----------------------------------------------------------------------------
-- 3. PERMISSIONS / GRANTS (Mencegah Error 42501 'permission denied')
-- ----------------------------------------------------------------------------
GRANT SELECT ON public.staff_assignments TO anon;
GRANT SELECT ON public.staff_assignments TO authenticated;
GRANT SELECT ON public.stations TO anon, authenticated;
GRANT SELECT ON public.routes TO anon, authenticated;
GRANT SELECT ON public.trains TO anon, authenticated;
GRANT SELECT ON public.schedules TO anon, authenticated;
GRANT SELECT ON public.carriages TO anon, authenticated;
GRANT SELECT ON public.seats TO anon, authenticated;
GRANT SELECT ON public.fares TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. FUNCTION: reschedule_own_paid_booking (Cutoff 2 Jam Sebelum Berangkat)
-- ----------------------------------------------------------------------------
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

    -- Cutoff: maksimal 2 jam sebelum keberangkatan
    IF v_old_departure <= now() + INTERVAL '2 hours' THEN
        RAISE EXCEPTION 'Tiket hanya dapat di-reschedule maksimal 2 jam sebelum keberangkatan kereta.';
    END IF;

    SELECT schedule.route_id, schedule.train_id, schedule.departure_time, fare.price
    INTO v_target_route_id, v_target_train_id, v_target_departure, v_fare
    FROM public.schedules schedule
    JOIN public.fares fare
      ON fare.schedule_id = schedule.id
     AND fare.carriage_class::TEXT = v_carriage_class
    WHERE schedule.id = p_schedule_id
      AND schedule.status IN ('scheduled', 'boarding', 'delayed')
      AND schedule.departure_time > now() + INTERVAL '2 hours'
    FOR UPDATE OF schedule, fare;

    IF NOT FOUND OR v_target_route_id IS DISTINCT FROM v_old_route_id THEN
        RAISE EXCEPTION 'Pilih jadwal yang tersedia pada rute yang sama, minimal 2 jam sebelum keberangkatan.';
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
        RAISE EXCEPTION 'Satu atau lebih kursi yang dipilih tidak tersedia pada jadwal dan kelas target.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.booking_seats booking_seat
        JOIN public.bookings booking ON booking.id = booking_seat.booking_id
        WHERE booking_seat.schedule_id = p_schedule_id
          AND booking_seat.seat_id = ANY(p_seat_ids)
          AND (
              booking.status = 'paid'
              OR (booking.status = 'pending' AND booking.expires_at > now())
          )
    ) THEN
        RAISE EXCEPTION 'Satu atau lebih kursi yang dipilih baru saja dipesan oleh penumpang lain.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.tickets ticket
        WHERE ticket.schedule_id = p_schedule_id
          AND ticket.seat_id = ANY(p_seat_ids)
    ) THEN
        RAISE EXCEPTION 'Satu atau lebih kursi yang dipilih sudah diterbitkan tiketnya.';
    END IF;

    v_new_fare_total := v_fare * v_passenger_count;
    v_fare_difference := GREATEST(0, v_new_fare_total - v_old_fare_total);
    v_reschedule_fee := round(v_fare_difference * 0.20, 2);
    v_new_total := v_old_total + v_fare_difference + v_reschedule_fee;

    UPDATE public.bookings
    SET schedule_id = p_schedule_id,
        total_amount = v_new_total,
        ticket_fare_amount = v_new_fare_total,
        reschedule_fee = v_reschedule_fee,
        updated_at = now()
    WHERE id = p_booking_id;

    UPDATE public.payments
    SET amount = v_new_total,
        updated_at = now()
    WHERE booking_id = p_booking_id
      AND status = 'confirmed';

    DELETE FROM public.tickets
    WHERE booking_id = p_booking_id;

    WITH indexed_passengers AS (
        SELECT passenger_id,
               row_number() OVER (ORDER BY passenger_id) AS row_num
        FROM public.booking_seats
        WHERE booking_id = p_booking_id
    ),
    ordered_seats AS (
        SELECT selected_seat AS seat_id,
               ordinality AS row_num
        FROM unnest(p_seat_ids) WITH ORDINALITY AS selected(selected_seat, ordinality)
    )
    UPDATE public.booking_seats bs
    SET schedule_id = p_schedule_id,
        seat_id = os.seat_id
    FROM indexed_passengers ip
    JOIN ordered_seats os ON os.row_num = ip.row_num
    WHERE bs.booking_id = p_booking_id
      AND bs.passenger_id = ip.passenger_id;

    UPDATE public.food_orders
    SET schedule_id = p_schedule_id,
        status = 'cancelled',
        updated_at = now()
    WHERE booking_id = p_booking_id
      AND status NOT IN ('completed', 'cancelled');

    INSERT INTO public.tickets (
        ticket_number,
        booking_id,
        passenger_id,
        schedule_id,
        seat_id,
        is_validated
    )
    SELECT 'TIX-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10)),
           bs.booking_id,
           bs.passenger_id,
           bs.schedule_id,
           bs.seat_id,
           false
    FROM public.booking_seats bs
    WHERE bs.booking_id = p_booking_id;

    RETURN jsonb_build_object(
        'booking_id', p_booking_id,
        'schedule_id', p_schedule_id,
        'fare_difference', v_fare_difference,
        'reschedule_fee', v_reschedule_fee,
        'additional_amount', v_fare_difference + v_reschedule_fee
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. FUNCTION: cancel_own_paid_booking (Cutoff 2 Jam Sebelum Berangkat)
-- ----------------------------------------------------------------------------
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

    -- Cutoff: maksimal 2 jam sebelum keberangkatan
    IF v_departure <= now() + INTERVAL '2 hours' THEN
        RAISE EXCEPTION 'Tiket hanya dapat dibatalkan maksimal 2 jam sebelum keberangkatan kereta.';
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

-- ----------------------------------------------------------------------------
-- 6. FUNCTION: admin_set_staff_role
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_staff_role(
  p_user_id UUID,
  p_staff_type TEXT,
  p_station_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can manage staff roles.';
  END IF;
  IF p_staff_type NOT IN ('gate', 'conductor') THEN
    RAISE EXCEPTION 'Invalid staff role.';
  END IF;
  IF p_staff_type = 'gate' AND p_station_id IS NULL THEN
    RAISE EXCEPTION 'Gate staff must be assigned to a station.';
  END IF;

  UPDATE public.profiles
  SET role = 'conductor',
      staff_type = p_staff_type,
      station_id = CASE WHEN p_staff_type = 'gate' THEN p_station_id ELSE NULL END
  WHERE id = p_user_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Staff member not found.'; END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. FUNCTION PERMISSION GRANTS
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.reschedule_own_paid_booking(UUID, UUID, UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reschedule_own_paid_booking(UUID, UUID, UUID[]) TO authenticated;

REVOKE ALL ON FUNCTION public.cancel_own_paid_booking(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_own_paid_booking(UUID) TO authenticated;

GRANT EXECUTE ON FUNCTION public.admin_set_staff_role(UUID, TEXT, UUID) TO authenticated;

COMMIT;
