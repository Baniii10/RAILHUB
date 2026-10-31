CREATE TABLE IF NOT EXISTS public.staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (staff_id, schedule_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_assignments_staff ON public.staff_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_schedule ON public.staff_assignments(schedule_id);
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.staff_assignments FROM anon, authenticated;
GRANT SELECT ON public.staff_assignments TO authenticated;

CREATE POLICY "Staff view own assignments or admin views all" ON public.staff_assignments
    FOR SELECT USING (staff_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users read own bookings" ON public.bookings;
CREATE POLICY "Passengers and assigned staff read bookings" ON public.bookings
    FOR SELECT USING (
        user_id = auth.uid()
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.staff_assignments assignment
            WHERE assignment.schedule_id = bookings.schedule_id
              AND assignment.staff_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users view passengers of their bookings" ON public.passengers;
CREATE POLICY "Passengers and assigned staff view passengers" ON public.passengers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings booking
            WHERE booking.id = passengers.booking_id
              AND (
                  booking.user_id = auth.uid()
                  OR public.is_admin()
                  OR EXISTS (
                      SELECT 1 FROM public.staff_assignments assignment
                      WHERE assignment.schedule_id = booking.schedule_id
                        AND assignment.staff_id = auth.uid()
                  )
              )
        )
    );

DROP POLICY IF EXISTS "Users manage booking seats of their bookings" ON public.booking_seats;
CREATE POLICY "Passengers and assigned staff view booking seats" ON public.booking_seats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings booking
            WHERE booking.id = booking_seats.booking_id
              AND (
                  booking.user_id = auth.uid()
                  OR public.is_admin()
                  OR EXISTS (
                      SELECT 1 FROM public.staff_assignments assignment
                      WHERE assignment.schedule_id = booking.schedule_id
                        AND assignment.staff_id = auth.uid()
                  )
              )
        )
    );

DROP POLICY IF EXISTS "Users view their own tickets" ON public.tickets;
CREATE POLICY "Passengers and assigned staff view tickets" ON public.tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings booking
            WHERE booking.id = tickets.booking_id
              AND (
                  booking.user_id = auth.uid()
                  OR public.is_admin()
                  OR EXISTS (
                      SELECT 1 FROM public.staff_assignments assignment
                      WHERE assignment.schedule_id = tickets.schedule_id
                        AND assignment.staff_id = auth.uid()
                  )
              )
        )
    );

CREATE TABLE IF NOT EXISTS public.journey_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    status schedule_status_type NOT NULL,
    note TEXT,
    updated_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journey_updates_schedule_time
    ON public.journey_updates(schedule_id, created_at DESC);
ALTER TABLE public.journey_updates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.journey_updates FROM anon, authenticated;
GRANT SELECT ON public.journey_updates TO authenticated;
GRANT SELECT ON public.journey_updates TO anon;

CREATE POLICY "Passengers view updates for paid journeys" ON public.journey_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.bookings booking
            WHERE booking.schedule_id = journey_updates.schedule_id
              AND booking.user_id = auth.uid()
              AND booking.status = 'paid'
        )
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.staff_assignments assignment
            WHERE assignment.schedule_id = journey_updates.schedule_id
              AND assignment.staff_id = auth.uid()
        )
    );

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only administrators can view operational dashboard statistics.';
    END IF;

    RETURN jsonb_build_object(
        'passengers', (SELECT count(*) FROM public.profiles WHERE role = 'passenger'),
        'bookings', (SELECT count(*) FROM public.bookings),
        'trains', (SELECT count(*) FROM public.trains),
        'stations', (SELECT count(*) FROM public.stations),
        'active_schedules', (
            SELECT count(*) FROM public.schedules
            WHERE status IN ('scheduled', 'boarding', 'departed', 'delayed')
        ),
        'revenue', COALESCE((
            SELECT sum(payment.amount)
            FROM public.payments payment
            WHERE payment.status = 'confirmed'
        ), 0)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_assign_staff(
    p_staff_id UUID,
    p_schedule_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_assignment_id UUID;
BEGIN
    IF auth.uid() IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only administrators can assign operational staff.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_staff_id AND role = 'conductor'
    ) THEN
        RAISE EXCEPTION 'The selected user is not an active staff profile.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.schedules
        WHERE id = p_schedule_id
          AND status <> 'cancelled'
          AND departure_time > now()
    ) THEN
        RAISE EXCEPTION 'The selected journey is not available for assignment.';
    END IF;

    INSERT INTO public.staff_assignments (staff_id, schedule_id, assigned_by)
    VALUES (p_staff_id, p_schedule_id, auth.uid())
    ON CONFLICT (staff_id, schedule_id) DO UPDATE
        SET assigned_by = EXCLUDED.assigned_by
    RETURNING id INTO v_assignment_id;

    RETURN v_assignment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_remove_staff_assignment(p_assignment_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only administrators can remove staff assignments.';
    END IF;

    DELETE FROM public.staff_assignments WHERE id = p_assignment_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Staff assignment was not found.';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_assigned_journey_status(
    p_schedule_id UUID,
    p_status schedule_status_type,
    p_note TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_update_id UUID;
BEGIN
    IF auth.uid() IS NULL OR (
        public.current_user_role() IS DISTINCT FROM 'conductor'
        AND NOT public.is_admin()
    ) THEN
        RAISE EXCEPTION 'Only authorized operational staff can update journey status.';
    END IF;

    IF NOT public.is_admin() AND NOT EXISTS (
        SELECT 1 FROM public.staff_assignments
        WHERE staff_id = auth.uid() AND schedule_id = p_schedule_id
    ) THEN
        RAISE EXCEPTION 'This journey is not assigned to you.';
    END IF;

    IF p_note IS NOT NULL AND length(trim(p_note)) > 500 THEN
        RAISE EXCEPTION 'Journey update notes must not exceed 500 characters.';
    END IF;

    UPDATE public.schedules
    SET status = p_status, updated_at = now()
    WHERE id = p_schedule_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Journey was not found.';
    END IF;

    INSERT INTO public.journey_updates (schedule_id, status, note, updated_by)
    VALUES (p_schedule_id, p_status, NULLIF(trim(p_note), ''), auth.uid())
    RETURNING id INTO v_update_id;

    RETURN v_update_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_assigned_ticket(p_ticket_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_ticket RECORD;
BEGIN
    IF auth.uid() IS NULL OR (
        public.current_user_role() IS DISTINCT FROM 'conductor'
        AND NOT public.is_admin()
    ) THEN
        RAISE EXCEPTION 'Only operational staff can validate tickets.';
    END IF;

    SELECT
        ticket.id,
        ticket.ticket_number,
        ticket.is_validated,
        ticket.validated_at,
        ticket.schedule_id,
        booking.status AS booking_status,
        schedule.status AS schedule_status,
        passenger.full_name,
        seat.seat_number,
        train.name AS train_name,
        schedule.departure_time
    INTO v_ticket
    FROM public.tickets ticket
    JOIN public.bookings booking ON booking.id = ticket.booking_id
    JOIN public.passengers passenger ON passenger.id = ticket.passenger_id
    JOIN public.seats seat ON seat.id = ticket.seat_id
    JOIN public.schedules schedule ON schedule.id = ticket.schedule_id
    JOIN public.trains train ON train.id = schedule.train_id
    WHERE upper(ticket.ticket_number) = upper(trim(p_ticket_number))
    FOR UPDATE OF ticket;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'INVALID', 'message', 'Tiket tidak ditemukan.');
    END IF;

    IF NOT public.is_admin() AND NOT EXISTS (
        SELECT 1 FROM public.staff_assignments
        WHERE staff_id = auth.uid() AND schedule_id = v_ticket.schedule_id
    ) THEN
        RAISE EXCEPTION 'This ticket is not for a journey assigned to you.';
    END IF;

    IF v_ticket.booking_status <> 'paid' THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNPAID', 'message', 'Booking belum dibayar atau sudah dibatalkan.');
    END IF;

    IF v_ticket.schedule_status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'code', 'CANCELLED', 'message', 'Perjalanan ini telah dibatalkan.');
    END IF;

    IF v_ticket.is_validated THEN
        RETURN jsonb_build_object(
            'success', false, 'code', 'ALREADY_USED', 'message', 'Tiket sudah pernah divalidasi.',
            'ticket_number', v_ticket.ticket_number, 'passenger_name', v_ticket.full_name,
            'seat_number', v_ticket.seat_number, 'validated_at', v_ticket.validated_at
        );
    END IF;

    UPDATE public.tickets
    SET is_validated = true, validated_at = now(), validated_by = auth.uid(), updated_at = now()
    WHERE id = v_ticket.id;

    RETURN jsonb_build_object(
        'success', true, 'code', 'VALID', 'message', 'Tiket valid. Penumpang dapat melanjutkan boarding.',
        'ticket_number', v_ticket.ticket_number, 'passenger_name', v_ticket.full_name,
        'seat_number', v_ticket.seat_number, 'train_name', v_ticket.train_name,
        'departure_time', v_ticket.departure_time, 'validated_at', now()
    );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_assign_staff(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_assign_staff(UUID, UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;
REVOKE ALL ON FUNCTION public.admin_remove_staff_assignment(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_staff_assignment(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.update_assigned_journey_status(UUID, schedule_status_type, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_assigned_journey_status(UUID, schedule_status_type, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.validate_assigned_ticket(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_assigned_ticket(TEXT) TO authenticated;
