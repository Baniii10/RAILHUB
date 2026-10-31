CREATE TABLE IF NOT EXISTS public.food_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.food_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.food_categories(id),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.food_categories (name, display_order)
VALUES ('Makanan', 1), ('Minuman', 2), ('Camilan', 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.food_products (category_id, sku, name, description, price)
SELECT category.id, product.sku, product.name, product.description, product.price
FROM (VALUES
    ('Makanan', 'RH-MEAL-001', 'Nasi ayam simulasi', 'Nasi hangat dengan ayam dan sayur.', 35000::NUMERIC),
    ('Makanan', 'RH-MEAL-002', 'Nasi rendang simulasi', 'Menu rendang fiktif untuk demonstrasi.', 42000::NUMERIC),
    ('Makanan', 'RH-MEAL-003', 'Mi goreng simulasi', 'Mi goreng dengan telur dan sayuran.', 28000::NUMERIC),
    ('Minuman', 'RH-DRINK-001', 'Air mineral', 'Air mineral botol 600 ml.', 8000::NUMERIC),
    ('Minuman', 'RH-DRINK-002', 'Teh hangat', 'Teh manis hangat.', 10000::NUMERIC),
    ('Camilan', 'RH-SNACK-001', 'Roti isi', 'Roti isi rasa pilihan simulasi.', 15000::NUMERIC)
) AS product(category_name, sku, name, description, price)
JOIN public.food_categories category ON category.name = product.category_name
ON CONFLICT (sku) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.food_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT NOT NULL UNIQUE DEFAULT ('FO-' || upper(substr(replace(gen_random_uuid()::TEXT, '-', ''), 1, 10))),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES public.schedules(id),
    passenger_id UUID NOT NULL REFERENCES public.passengers(id),
    seat_id UUID NOT NULL REFERENCES public.seats(id),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'on_the_way', 'completed', 'cancelled')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_orders_schedule_status ON public.food_orders(schedule_id, status);
CREATE INDEX IF NOT EXISTS idx_food_orders_booking ON public.food_orders(booking_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.food_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.food_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.food_products(id),
    quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_food_order_items_order ON public.food_order_items(order_id);

CREATE TABLE IF NOT EXISTS public.passenger_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    passenger_name TEXT NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('assistance', 'lost_found', 'complaint', 'other')),
    title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 3 AND 120),
    description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 5 AND 2000),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
    response_note TEXT,
    responded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_passenger_reports_schedule_status
    ON public.passenger_reports(schedule_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_passenger_reports_user ON public.passenger_reports(user_id, created_at DESC);

ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passenger_reports ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.food_categories, public.food_products, public.food_orders,
    public.food_order_items, public.passenger_reports FROM anon, authenticated;
GRANT SELECT ON public.food_categories, public.food_products TO anon, authenticated;
GRANT SELECT ON public.food_orders, public.food_order_items, public.passenger_reports TO authenticated;

CREATE POLICY "Public reads active menu" ON public.food_categories
    FOR SELECT USING (is_active);
CREATE POLICY "Public reads active menu products" ON public.food_products
    FOR SELECT USING (is_active AND EXISTS (
        SELECT 1 FROM public.food_categories category
        WHERE category.id = food_products.category_id AND category.is_active
    ));

CREATE POLICY "Passengers and assigned staff view food orders" ON public.food_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings booking
            WHERE booking.id = food_orders.booking_id AND booking.user_id = auth.uid()
        )
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.staff_assignments assignment
            WHERE assignment.schedule_id = food_orders.schedule_id
              AND assignment.staff_id = auth.uid()
        )
    );

CREATE POLICY "Passengers and assigned staff view food order items" ON public.food_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.food_orders food_order
            WHERE food_order.id = food_order_items.order_id
              AND (
                  EXISTS (
                      SELECT 1 FROM public.bookings booking
                      WHERE booking.id = food_order.booking_id AND booking.user_id = auth.uid()
                  )
                  OR public.is_admin()
                  OR EXISTS (
                      SELECT 1 FROM public.staff_assignments assignment
                      WHERE assignment.schedule_id = food_order.schedule_id
                        AND assignment.staff_id = auth.uid()
                  )
              )
        )
    );

CREATE POLICY "Passengers and assigned staff view reports" ON public.passenger_reports
    FOR SELECT USING (
        user_id = auth.uid()
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.staff_assignments assignment
            WHERE assignment.schedule_id = passenger_reports.schedule_id
              AND assignment.staff_id = auth.uid()
        )
    );

CREATE OR REPLACE FUNCTION public.create_passenger_food_order(
    p_booking_id UUID,
    p_passenger_id UUID,
    p_seat_id UUID,
    p_items JSONB,
    p_note TEXT DEFAULT NULL
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
       OR (p_note IS NOT NULL AND length(trim(p_note)) > 300) THEN
        RAISE EXCEPTION 'Food order details are invalid.';
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
        booking_id, schedule_id, passenger_id, seat_id, total_amount, note
    ) VALUES (
        p_booking_id, v_schedule_id, p_passenger_id, p_seat_id, v_total, NULLIF(trim(p_note), '')
    ) RETURNING id INTO v_order_id;

    INSERT INTO public.food_order_items (order_id, product_id, quantity, unit_price)
    SELECT v_order_id, product.id, requested.quantity, product.price
    FROM jsonb_to_recordset(p_items) AS requested(product_id UUID, quantity INTEGER)
    JOIN public.food_products product ON product.id = requested.product_id;

    RETURN v_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_passenger_report(
    p_category TEXT,
    p_title TEXT,
    p_description TEXT,
    p_booking_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_schedule_id UUID;
    v_report_id UUID;
BEGIN
    IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'passenger' THEN
        RAISE EXCEPTION 'Only authenticated passengers can submit reports.';
    END IF;

    IF p_category NOT IN ('assistance', 'lost_found', 'complaint', 'other')
       OR length(trim(p_title)) NOT BETWEEN 3 AND 120
       OR length(trim(p_description)) NOT BETWEEN 5 AND 2000 THEN
        RAISE EXCEPTION 'Report details are invalid.';
    END IF;

    IF p_booking_id IS NOT NULL THEN
        SELECT booking.schedule_id INTO v_schedule_id
        FROM public.bookings booking
        WHERE booking.id = p_booking_id
          AND booking.user_id = auth.uid()
          AND booking.status = 'paid';

        IF v_schedule_id IS NULL THEN
            RAISE EXCEPTION 'The selected journey is not one of your paid bookings.';
        END IF;
    END IF;

    INSERT INTO public.passenger_reports (
        user_id, passenger_name, booking_id, schedule_id, category, title, description
    ) VALUES (
        auth.uid(),
        (SELECT profile.full_name FROM public.profiles profile WHERE profile.id = auth.uid()),
        p_booking_id, v_schedule_id, p_category,
        trim(p_title), trim(p_description)
    ) RETURNING id INTO v_report_id;

    RETURN v_report_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.staff_update_food_order(
    p_order_id UUID,
    p_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_current_status TEXT;
BEGIN
    IF auth.uid() IS NULL OR (
        public.current_user_role() IS DISTINCT FROM 'conductor'
        AND NOT public.is_admin()
    ) THEN
        RAISE EXCEPTION 'Only operational staff can process food orders.';
    END IF;

    IF p_status NOT IN ('confirmed', 'preparing', 'on_the_way', 'completed', 'cancelled') THEN
        RAISE EXCEPTION 'Food order status is invalid.';
    END IF;

    SELECT food_order.status INTO v_current_status
    FROM public.food_orders food_order
    WHERE food_order.id = p_order_id
      AND (
          public.is_admin()
          OR EXISTS (
              SELECT 1 FROM public.staff_assignments assignment
              WHERE assignment.schedule_id = food_order.schedule_id
                AND assignment.staff_id = auth.uid()
          )
      )
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'Food order not found or journey is not assigned to you.';
    END IF;

    IF v_current_status IN ('completed', 'cancelled')
       OR (p_status <> 'cancelled' AND
           CASE v_current_status
               WHEN 'pending' THEN p_status <> 'confirmed'
               WHEN 'confirmed' THEN p_status <> 'preparing'
               WHEN 'preparing' THEN p_status <> 'on_the_way'
               WHEN 'on_the_way' THEN p_status <> 'completed'
               ELSE true
           END) THEN
        RAISE EXCEPTION 'Food order status transition is not allowed.';
    END IF;

    UPDATE public.food_orders
    SET status = p_status, updated_at = now()
    WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.staff_update_passenger_report(
    p_report_id UUID,
    p_status TEXT,
    p_response_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_schedule_id UUID;
    v_current_status TEXT;
BEGIN
    IF auth.uid() IS NULL OR (
        public.current_user_role() IS DISTINCT FROM 'conductor'
        AND NOT public.is_admin()
    ) THEN
        RAISE EXCEPTION 'Only operational staff can process passenger reports.';
    END IF;

    IF p_status NOT IN ('in_progress', 'resolved', 'rejected')
       OR (p_response_note IS NOT NULL AND length(trim(p_response_note)) > 1000) THEN
        RAISE EXCEPTION 'Report update details are invalid.';
    END IF;

    SELECT report.schedule_id, report.status
    INTO v_schedule_id, v_current_status
    FROM public.passenger_reports report
    WHERE report.id = p_report_id
      AND (
          public.is_admin()
          OR EXISTS (
              SELECT 1 FROM public.staff_assignments assignment
              WHERE assignment.schedule_id = report.schedule_id
                AND assignment.staff_id = auth.uid()
          )
      )
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Report not found or journey is not assigned to you.';
    END IF;

    IF v_current_status IN ('resolved', 'rejected')
       OR (v_current_status = 'pending' AND p_status NOT IN ('in_progress', 'resolved', 'rejected'))
       OR (v_current_status = 'in_progress' AND p_status NOT IN ('resolved', 'rejected')) THEN
        RAISE EXCEPTION 'Report status transition is not allowed.';
    END IF;

    UPDATE public.passenger_reports
    SET status = p_status,
        response_note = NULLIF(trim(p_response_note), ''),
        responded_by = auth.uid(),
        updated_at = now()
    WHERE id = p_report_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_passenger_food_order(UUID, UUID, UUID, JSONB, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_passenger_food_order(UUID, UUID, UUID, JSONB, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.create_passenger_report(TEXT, TEXT, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_passenger_report(TEXT, TEXT, TEXT, UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.staff_update_food_order(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.staff_update_food_order(UUID, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.staff_update_passenger_report(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.staff_update_passenger_report(UUID, TEXT, TEXT) TO authenticated;
