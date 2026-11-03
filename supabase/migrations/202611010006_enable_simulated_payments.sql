GRANT EXECUTE ON FUNCTION public.simulate_booking_payment(UUID)
    TO authenticated;

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
            'GRANT EXECUTE ON FUNCTION %s TO authenticated',
            function_signature
        );
    END LOOP;
END;
$$;
