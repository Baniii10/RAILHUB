ALTER TABLE public.food_orders
    ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'simulation'
        CHECK (payment_method IN ('simulation', 'qris', 'e_wallet', 'bank_transfer'));

DROP FUNCTION IF EXISTS public.create_passenger_food_order(UUID, UUID, UUID, JSONB, TEXT);

CREATE OR REPLACE FUNCTION public.create_passenger_food_order(
    p_booking_id UUID,
    p_passenger_id UUID,
    p_seat_id UUID,
    p_items JSONB,
    p_note TEXT DEFAULT NULL,
    p_payment_method TEXT DEFAULT 'simulation'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_schedule_id UUID;
    v_order_id UUID;
    v_total NUMERIC(12, 2);
    v_item_count INTEGER;
BEGIN
    IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'passenger' THEN
        RAISE EXCEPTION 'Only authenticated passengers can order food.';
    END IF;

    IF jsonb_typeof(p_items) IS DISTINCT FROM 'array'
       OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 10
       OR (p_note IS NOT NULL AND length(trim(p_note)) > 300)
       OR p_payment_method NOT IN ('simulation', 'qris', 'e_wallet', 'bank_transfer') THEN
        RAISE EXCEPTION 'Food order or payment details are invalid.';
    END IF;

    SELECT booking.schedule_id INTO v_schedule_id
    FROM public.bookings booking
    JOIN public.booking_seats booking_seat
      ON booking_seat.booking_id = booking.id
     AND booking_seat.passenger_id = p_passenger_id
     AND booking_seat.seat_id = p_seat_id
    WHERE booking.id = p_booking_id
      AND booking.user_id = auth.uid()
      AND booking.status = 'paid'
      AND booking.schedule_id IN (
          SELECT schedule.id FROM public.schedules schedule
          WHERE schedule.id = booking.schedule_id
            AND schedule.status NOT IN ('cancelled', 'arrived')
      );

    IF v_schedule_id IS NULL THEN
        RAISE EXCEPTION 'A paid booking with the selected passenger and seat is required.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM jsonb_to_recordset(p_items) AS requested(product_id UUID, quantity INTEGER)
        WHERE requested.product_id IS NULL OR requested.quantity NOT BETWEEN 1 AND 10
    ) OR (
        SELECT count(*) FROM jsonb_to_recordset(p_items) AS requested(product_id UUID, quantity INTEGER)
    ) <> (
        SELECT count(DISTINCT requested.product_id)
        FROM jsonb_to_recordset(p_items) AS requested(product_id UUID, quantity INTEGER)
    ) THEN
        RAISE EXCEPTION 'Food products or quantities are invalid.';
    END IF;

    SELECT sum(product.price * requested.quantity), count(*)
    INTO v_total, v_item_count
    FROM jsonb_to_recordset(p_items) AS requested(product_id UUID, quantity INTEGER)
    JOIN public.food_products product
      ON product.id = requested.product_id
     AND product.is_active
    JOIN public.food_categories category
      ON category.id = product.category_id
     AND category.is_active;

    IF v_item_count <> jsonb_array_length(p_items) OR v_total IS NULL THEN
        RAISE EXCEPTION 'One or more selected menu items are no longer available.';
    END IF;

    INSERT INTO public.food_orders (
        booking_id, schedule_id, passenger_id, seat_id, total_amount, note, payment_method
    ) VALUES (
        p_booking_id, v_schedule_id, p_passenger_id, p_seat_id, v_total,
        NULLIF(trim(p_note), ''), p_payment_method
    ) RETURNING id INTO v_order_id;

    INSERT INTO public.food_order_items (order_id, product_id, quantity, unit_price)
    SELECT v_order_id, product.id, requested.quantity, product.price
    FROM jsonb_to_recordset(p_items) AS requested(product_id UUID, quantity INTEGER)
    JOIN public.food_products product ON product.id = requested.product_id;

    RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_passenger_food_order(
    UUID, UUID, UUID, JSONB, TEXT, TEXT
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_passenger_food_order(
    UUID, UUID, UUID, JSONB, TEXT, TEXT
) TO authenticated;
