BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS staff_type TEXT,
  ADD COLUMN IF NOT EXISTS station_id UUID REFERENCES public.stations(id) ON DELETE SET NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_staff_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_staff_type_check
  CHECK (staff_type IS NULL OR staff_type IN ('gate', 'conductor'));
CREATE INDEX IF NOT EXISTS idx_profiles_station_id ON public.profiles(station_id);

UPDATE public.profiles
SET staff_type = 'conductor'
WHERE role = 'conductor' AND staff_type IS NULL;

CREATE OR REPLACE FUNCTION public.configure_demo_profile()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_email TEXT := lower(COALESCE(auth.jwt() ->> 'email', ''));
  v_station_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required.'; END IF;

  IF v_email = 'gate.gambir@railhub.id' THEN
    SELECT id INTO v_station_id FROM public.stations WHERE code = 'GMR' ORDER BY created_at LIMIT 1;
    UPDATE public.profiles SET role = 'conductor', staff_type = 'gate', station_id = v_station_id WHERE id = auth.uid();
  ELSIF v_email = 'kondektur.parahyangan@railhub.id' THEN
    UPDATE public.profiles SET role = 'conductor', staff_type = 'conductor', station_id = NULL WHERE id = auth.uid();
  ELSIF v_email = 'admin.operasional@railhub.id' THEN
    UPDATE public.profiles SET role = 'admin', staff_type = NULL, station_id = NULL WHERE id = auth.uid();
  ELSIF v_email = 'penumpang.demo@railhub.id' THEN
    UPDATE public.profiles SET role = 'passenger', staff_type = NULL, station_id = NULL WHERE id = auth.uid();
  ELSE
    RAISE EXCEPTION 'This account is not a RAILHUB demo account.';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.configure_demo_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.configure_demo_profile() TO authenticated;

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
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN RAISE EXCEPTION 'Only administrators can manage staff roles.'; END IF;
  IF p_staff_type NOT IN ('gate', 'conductor') THEN RAISE EXCEPTION 'Invalid staff role.'; END IF;
  IF p_staff_type = 'gate' AND p_station_id IS NULL THEN RAISE EXCEPTION 'Gate staff must be assigned to a station.'; END IF;

  UPDATE public.profiles
  SET role = 'conductor', staff_type = p_staff_type,
      station_id = CASE WHEN p_staff_type = 'gate' THEN p_station_id ELSE NULL END
  WHERE id = p_user_id AND role <> 'admin';
  IF NOT FOUND THEN RAISE EXCEPTION 'User was not found or is an administrator.'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_staff_role(UUID, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_staff_role(UUID, TEXT, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.validate_assigned_ticket(p_ticket_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ticket RECORD;
  v_profile RECORD;
BEGIN
  SELECT role, staff_type, station_id INTO v_profile FROM public.profiles WHERE id = auth.uid();
  IF auth.uid() IS NULL OR (v_profile.role <> 'conductor' AND NOT public.is_admin()) THEN
    RAISE EXCEPTION 'Only operational staff can validate tickets.';
  END IF;

  SELECT ticket.id, ticket.ticket_number, ticket.is_validated, ticket.validated_at,
         ticket.schedule_id, booking.status AS booking_status, schedule.status AS schedule_status,
         route.origin_station_id, passenger.full_name, seat.seat_number,
         train.name AS train_name, schedule.departure_time
  INTO v_ticket
  FROM public.tickets ticket
  JOIN public.bookings booking ON booking.id = ticket.booking_id
  JOIN public.passengers passenger ON passenger.id = ticket.passenger_id
  JOIN public.seats seat ON seat.id = ticket.seat_id
  JOIN public.schedules schedule ON schedule.id = ticket.schedule_id
  JOIN public.routes route ON route.id = schedule.route_id
  JOIN public.trains train ON train.id = schedule.train_id
  WHERE upper(ticket.ticket_number) = upper(trim(p_ticket_number))
  FOR UPDATE OF ticket;

  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'code', 'INVALID', 'message', 'Tiket tidak ditemukan.'); END IF;

  IF NOT public.is_admin() AND (
    (v_profile.staff_type = 'gate' AND v_profile.station_id IS DISTINCT FROM v_ticket.origin_station_id)
    OR (v_profile.staff_type = 'conductor' AND NOT EXISTS (
      SELECT 1 FROM public.staff_assignments WHERE staff_id = auth.uid() AND schedule_id = v_ticket.schedule_id
    ))
  ) THEN RAISE EXCEPTION 'Tiket ini berada di luar penugasan Anda.'; END IF;

  IF v_ticket.booking_status <> 'paid' THEN RETURN jsonb_build_object('success', false, 'code', 'UNPAID', 'message', 'Booking belum dibayar atau sudah dibatalkan.'); END IF;
  IF v_ticket.schedule_status = 'cancelled' THEN RETURN jsonb_build_object('success', false, 'code', 'CANCELLED', 'message', 'Perjalanan ini telah dibatalkan.'); END IF;
  IF v_ticket.is_validated THEN
    RETURN jsonb_build_object('success', false, 'code', 'ALREADY_USED', 'message', 'Tiket sudah pernah divalidasi.', 'ticket_number', v_ticket.ticket_number, 'passenger_name', v_ticket.full_name, 'seat_number', v_ticket.seat_number, 'validated_at', v_ticket.validated_at);
  END IF;

  UPDATE public.tickets SET is_validated = true, validated_at = now(), validated_by = auth.uid(), updated_at = now() WHERE id = v_ticket.id;
  RETURN jsonb_build_object('success', true, 'code', 'VALID', 'message', 'Tiket valid. Penumpang dapat melanjutkan boarding.', 'ticket_number', v_ticket.ticket_number, 'passenger_name', v_ticket.full_name, 'seat_number', v_ticket.seat_number, 'train_name', v_ticket.train_name, 'departure_time', v_ticket.departure_time, 'validated_at', now());
END;
$$;
REVOKE ALL ON FUNCTION public.validate_assigned_ticket(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_assigned_ticket(TEXT) TO authenticated;

COMMIT;
