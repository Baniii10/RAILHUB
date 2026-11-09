-- ============================================================================
-- SCRIPT RESET SEMUA TIKET DAN BOOKING (BERSIH TOTAL / CLEAN SLATE)
-- Jalankan skrip ini langsung di Supabase Dashboard -> SQL Editor (Ctrl+Enter)
-- URL: https://supabase.com/dashboard/project/youqixjjsdhgmkzdjjck/sql/new
-- ============================================================================

BEGIN;

-- 1. Hapus seluruh data tiket yang pernah diterbitkan
TRUNCATE TABLE public.tickets CASCADE;

-- 2. Lepaskan seluruh penahanan kursi pemesanan
TRUNCATE TABLE public.booking_seats CASCADE;

-- 3. Hapus pesanan makanan on-train
TRUNCATE TABLE public.food_orders CASCADE;

-- 4. Hapus seluruh riwayat pembayaran
TRUNCATE TABLE public.payments CASCADE;

-- 5. Hapus seluruh data pemesanan (bookings) dari akun manapun
TRUNCATE TABLE public.bookings CASCADE;

-- ----------------------------------------------------------------------------
-- FUNGSI RPC RESET_ALL_BOOKINGS (Agar dapat dipanggil ulang jika diperlukan)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reset_all_bookings()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    DELETE FROM public.tickets;
    DELETE FROM public.booking_seats;
    DELETE FROM public.food_orders;
    DELETE FROM public.payments;
    DELETE FROM public.bookings;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_all_bookings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_all_bookings() TO authenticated, anon;

COMMIT;
