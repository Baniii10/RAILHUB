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
    v_current_status schedule_status_type;
    v_transition_allowed BOOLEAN := false;
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

    SELECT schedule.status
    INTO v_current_status
    FROM public.schedules schedule
    WHERE schedule.id = p_schedule_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Journey was not found.';
    END IF;

    v_transition_allowed := CASE v_current_status
        WHEN 'scheduled' THEN p_status IN ('boarding', 'delayed', 'cancelled')
        WHEN 'boarding' THEN p_status IN ('departed', 'delayed', 'cancelled')
        WHEN 'departed' THEN p_status IN ('delayed', 'arrived')
        WHEN 'delayed' THEN p_status IN ('boarding', 'departed', 'arrived', 'cancelled')
        ELSE false
    END;

    IF NOT v_transition_allowed THEN
        RAISE EXCEPTION 'Journey status transition from % to % is not allowed.',
            v_current_status, p_status;
    END IF;

    UPDATE public.schedules
    SET status = p_status, updated_at = now()
    WHERE id = p_schedule_id;

    INSERT INTO public.journey_updates (schedule_id, status, note, updated_by)
    VALUES (p_schedule_id, p_status, NULLIF(trim(p_note), ''), auth.uid())
    RETURNING id INTO v_update_id;

    RETURN v_update_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_assigned_journey_status(UUID, schedule_status_type, TEXT)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_assigned_journey_status(UUID, schedule_status_type, TEXT)
    TO authenticated;
