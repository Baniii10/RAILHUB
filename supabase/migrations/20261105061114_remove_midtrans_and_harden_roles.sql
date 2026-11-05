BEGIN;

DROP FUNCTION IF EXISTS public.confirm_midtrans_booking_payment(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.confirm_midtrans_food_payment(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_passenger_food_payment_intent(UUID, UUID, UUID, JSONB, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.configure_demo_profile();
DROP TABLE IF EXISTS public.food_payment_intents;

UPDATE public.profiles
SET role = 'passenger', staff_type = NULL, station_id = NULL
WHERE lower(email) IN (
  'admin.operasional@railhub.id',
  'gate.gambir@railhub.id',
  'kondektur.parahyangan@railhub.id',
  'penumpang.demo@railhub.id'
);

ALTER TABLE public.payments
  DROP COLUMN IF EXISTS gateway_order_id,
  DROP COLUMN IF EXISTS gateway_transaction_id,
  DROP COLUMN IF EXISTS gateway_transaction_status,
  DROP COLUMN IF EXISTS payment_url;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id UUID, p_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can manage user roles.';
  END IF;
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Administrators cannot change their own role.';
  END IF;
  IF p_role NOT IN ('passenger', 'conductor', 'admin') THEN
    RAISE EXCEPTION 'Invalid user role.';
  END IF;

  UPDATE public.profiles
  SET role = p_role,
      staff_type = CASE WHEN p_role = 'conductor' THEN 'conductor' ELSE NULL END,
      station_id = NULL
  WHERE id = p_user_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'User was not found.'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_role(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) TO authenticated;

COMMIT;
