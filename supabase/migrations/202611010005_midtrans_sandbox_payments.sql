ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS gateway_order_id TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT,
    ADD COLUMN IF NOT EXISTS gateway_transaction_status TEXT,
    ADD COLUMN IF NOT EXISTS payment_url TEXT;

ALTER TABLE public.food_orders
    ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'simulation'
        CHECK (payment_method IN ('simulation', 'qris', 'e_wallet', 'bank_transfer'));

CREATE TABLE IF NOT EXISTS public.food_payment_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES public.passengers(id),
    seat_id UUID NOT NULL REFERENCES public.seats(id),
    items JSONB NOT NULL CHECK (jsonb_typeof(items) = 'array'),
    note TEXT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('qris', 'e_wallet', 'bank_transfer')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'cancelled')),
    gateway_order_id TEXT UNIQUE,
    gateway_transaction_id TEXT,
    gateway_transaction_status TEXT,
    payment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_payment_intents_user
    ON public.food_payment_intents(user_id, created_at DESC);
ALTER TABLE public.food_payment_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.food_payment_intents FROM anon, authenticated;
GRANT ALL ON public.food_payment_intents TO service_role;
GRANT SELECT ON public.bookings TO service_role;
GRANT SELECT, UPDATE ON public.payments TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.food_orders, public.food_order_items TO service_role;

REVOKE ALL ON FUNCTION public.simulate_booking_payment(UUID)
    FROM PUBLIC, anon, authenticated;
DO $$
DECLARE
    function_signature TEXT;
BEGIN
    FOR function_signature IN
        SELECT procedure.oid::regprocedure::TEXT
        FROM pg_proc procedure
        JOIN pg_namespace namespace ON namespace.oid = procedure.pronamespace
        WHERE namespace.nspname = 'public'
          AND procedure.proname = 'create_passenger_food_order'
    LOOP
        EXECUTE format(
            'REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',
            function_signature
        );
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_passenger_food_payment_intent(
    p_booking_id UUID,
    p_passenger_id UUID,
    p_seat_id UUID,
    p_items JSONB,
    p_note TEXT,
    p_payment_method TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_schedule_id UUID;
    v_intent_id UUID;
    v_total NUMERIC(12, 2);
    v_item_count INTEGER;
    v_items JSONB;
BEGIN
    IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'passenger' THEN
        RAISE EXCEPTION 'Only authenticated passengers can order food.';
    END IF;

    IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Food order items must be a JSON array.';
    END IF;

    IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 10
       OR (p_note IS NOT NULL AND length(trim(p_note)) > 300)
       OR p_payment_method IS NULL
       OR p_payment_method NOT IN ('qris', 'e_wallet', 'bank_transfer') THEN
        RAISE EXCEPTION 'Food order details or payment method are invalid.';
    END IF;

    SELECT booking.schedule_id INTO v_schedule_id
    FROM public.bookings booking
    JOIN public.booking_seats booking_seat
      ON booking_seat.booking_id = booking.id
     AND booking_seat.passenger_id = p_passenger_id
     AND booking_seat.seat_id = p_seat_id
    JOIN public.schedules schedule
      ON schedule.id = booking.schedule_id
     AND schedule.status NOT IN ('cancelled', 'arrived')
    WHERE booking.id = p_booking_id
      AND booking.user_id = auth.uid()
      AND booking.status = 'paid';

    IF v_schedule_id IS NULL THEN
        RAISE EXCEPTION 'A paid booking with the selected passenger and seat is required.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_to_recordset(p_items) AS requested(product_id UUID, quantity INTEGER)
        WHERE requested.product_id IS NULL OR requested.quantity NOT BETWEEN 1 AND 10
    ) OR (
        SELECT count(*) FROM jsonb_to_recordset(p_items) AS requested(product_id UUID, quantity INTEGER)
    ) <> (
        SELECT count(DISTINCT requested.product_id)
        FROM jsonb_to_recordset(p_items) AS requested(product_id UUID, quantity INTEGER)
    ) THEN
        RAISE EXCEPTION 'Food products or quantities are invalid.';
    END IF;

    SELECT sum(product.price * requested.quantity), count(*),
           jsonb_agg(jsonb_build_object(
               'product_id', product.id,
               'quantity', requested.quantity,
               'unit_price', product.price
           ))
    INTO v_total, v_item_count, v_items
    FROM jsonb_to_recordset(p_items) AS requested(product_id UUID, quantity INTEGER)
    JOIN public.food_products product
      ON product.id = requested.product_id
     AND product.is_active
    JOIN public.food_categories category
      ON category.id = product.category_id
     AND category.is_active;

    IF v_item_count <> jsonb_array_length(p_items) OR v_total IS NULL OR v_total <= 0
       OR trunc(v_total) <> v_total THEN
        RAISE EXCEPTION 'One or more menu items are unavailable or have an invalid payment amount.';
    END IF;

    INSERT INTO public.food_payment_intents (
        booking_id, user_id, passenger_id, seat_id, items, note,
        payment_method, total_amount
    ) VALUES (
        p_booking_id, auth.uid(), p_passenger_id, p_seat_id, v_items,
        NULLIF(trim(p_note), ''), p_payment_method, v_total
    ) RETURNING id INTO v_intent_id;

    RETURN v_intent_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_passenger_food_payment_intent(
    UUID, UUID, UUID, JSONB, TEXT, TEXT
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_passenger_food_payment_intent(
    UUID, UUID, UUID, JSONB, TEXT, TEXT
) TO authenticated;

CREATE OR REPLACE FUNCTION public.confirm_midtrans_booking_payment(
    p_order_id TEXT,
    p_transaction_id TEXT,
    p_transaction_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_booking_id UUID;
    v_booking public.bookings%ROWTYPE;
    v_payment public.payments%ROWTYPE;
    v_seat RECORD;
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'Only the payment service can confirm Midtrans payments.';
    END IF;
    IF p_transaction_status NOT IN ('settlement', 'capture') THEN
        RAISE EXCEPTION 'The Midtrans transaction is not paid.';
    END IF;

    SELECT payment.booking_id INTO v_booking_id
    FROM public.payments payment
    WHERE payment.gateway_order_id = p_order_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Midtrans order was not found.';
    END IF;

    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = v_booking_id
    FOR UPDATE;
    SELECT * INTO v_payment
    FROM public.payments
    WHERE booking_id = v_booking_id
    FOR UPDATE;

    IF v_booking.status = 'paid' AND v_payment.status = 'confirmed' THEN
        RETURN;
    END IF;
    IF v_booking.status <> 'pending'
       OR v_payment.status <> 'pending'
       OR v_payment.amount <> v_booking.total_amount THEN
        RAISE EXCEPTION 'The pending booking or payment is missing or inconsistent.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.booking_seats WHERE booking_id = v_booking_id) THEN
        RAISE EXCEPTION 'The booking has no allocated passengers or seats.';
    END IF;

    UPDATE public.payments
    SET status = 'confirmed',
        gateway_transaction_id = p_transaction_id,
        gateway_transaction_status = p_transaction_status,
        confirmed_at = now(),
        updated_at = now()
    WHERE id = v_payment.id;
    UPDATE public.bookings
    SET status = 'paid', updated_at = now()
    WHERE id = v_booking_id;

    FOR v_seat IN
        SELECT passenger_id, schedule_id, seat_id
        FROM public.booking_seats
        WHERE booking_id = v_booking_id
    LOOP
        INSERT INTO public.tickets (
            ticket_number, booking_id, passenger_id, schedule_id, seat_id
        ) VALUES (
            'TKT-' || upper(replace(gen_random_uuid()::TEXT, '-', '')),
            v_booking_id, v_seat.passenger_id, v_seat.schedule_id, v_seat.seat_id
        );
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_midtrans_food_payment(
    p_order_id TEXT,
    p_transaction_id TEXT,
    p_transaction_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_intent public.food_payment_intents%ROWTYPE;
    v_order_id UUID;
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'Only the payment service can confirm Midtrans payments.';
    END IF;
    IF p_transaction_status NOT IN ('settlement', 'capture') THEN
        RAISE EXCEPTION 'The Midtrans transaction is not paid.';
    END IF;

    SELECT * INTO v_intent
    FROM public.food_payment_intents
    WHERE gateway_order_id = p_order_id
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Midtrans food order was not found.';
    END IF;
    IF v_intent.status = 'paid' THEN
        RETURN;
    END IF;
    IF v_intent.status <> 'pending' THEN
        RAISE EXCEPTION 'The food payment intent is no longer payable.';
    END IF;

    INSERT INTO public.food_orders (
        booking_id, schedule_id, passenger_id, seat_id, total_amount, note, payment_method
    )
    SELECT v_intent.booking_id, booking.schedule_id, v_intent.passenger_id,
           v_intent.seat_id, v_intent.total_amount, v_intent.note, v_intent.payment_method
    FROM public.bookings booking
    WHERE booking.id = v_intent.booking_id
      AND booking.user_id = v_intent.user_id
      AND booking.status = 'paid'
    RETURNING id INTO v_order_id;
    IF v_order_id IS NULL THEN
        RAISE EXCEPTION 'The paid journey for this food order could not be found.';
    END IF;

    INSERT INTO public.food_order_items (order_id, product_id, quantity, unit_price)
    SELECT v_order_id, requested.product_id, requested.quantity, requested.unit_price
    FROM jsonb_to_recordset(v_intent.items)
         AS requested(product_id UUID, quantity INTEGER, unit_price NUMERIC);

    UPDATE public.food_payment_intents
    SET status = 'paid',
        gateway_transaction_id = p_transaction_id,
        gateway_transaction_status = p_transaction_status,
        updated_at = now()
    WHERE id = v_intent.id;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_midtrans_booking_payment(TEXT, TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.confirm_midtrans_food_payment(TEXT, TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_midtrans_booking_payment(TEXT, TEXT, TEXT)
    TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_midtrans_food_payment(TEXT, TEXT, TEXT)
    TO service_role;
