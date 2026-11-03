CREATE OR REPLACE FUNCTION public.select_booking_payment_method(
    p_booking_id UUID,
    p_payment_method TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_amount NUMERIC(12, 2);
BEGIN
    IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'passenger' THEN
        RAISE EXCEPTION 'Only authenticated passengers can select a payment method.';
    END IF;

    IF p_payment_method NOT IN ('bank_transfer', 'e_wallet', 'qr_payment') THEN
        RAISE EXCEPTION 'Payment method is invalid.';
    END IF;

    SELECT booking.total_amount INTO v_amount
    FROM public.bookings booking
    WHERE booking.id = p_booking_id
      AND booking.user_id = auth.uid()
      AND booking.status = 'pending'
      AND booking.expires_at > now()
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Only your active pending bookings can select a payment method.';
    END IF;

    UPDATE public.payments payment
    SET method = p_payment_method,
        updated_at = now()
    WHERE payment.booking_id = p_booking_id
      AND payment.status = 'pending'
      AND payment.amount = v_amount;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'The pending payment record is missing or inconsistent.';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.select_booking_payment_method(UUID, TEXT)
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.select_booking_payment_method(UUID, TEXT)
    TO authenticated;
