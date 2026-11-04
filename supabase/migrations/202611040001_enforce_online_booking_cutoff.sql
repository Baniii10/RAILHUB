CREATE OR REPLACE FUNCTION public.enforce_online_booking_cutoff()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.status = 'pending' AND EXISTS (
        SELECT 1
        FROM public.schedules schedule
        WHERE schedule.id = NEW.schedule_id
          AND schedule.departure_time <= now() + INTERVAL '1 hour'
    ) THEN
        RAISE EXCEPTION 'Online booking closes one hour before departure.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_online_booking_cutoff ON public.bookings;
CREATE TRIGGER enforce_online_booking_cutoff
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.enforce_online_booking_cutoff();
