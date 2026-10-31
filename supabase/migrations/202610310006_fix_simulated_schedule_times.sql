UPDATE public.schedules
SET departure_time = (
        (departure_time AT TIME ZONE 'Asia/Jakarta')::DATE + TIME '07:00'
    ) AT TIME ZONE 'Asia/Jakarta',
    arrival_time = (
        (departure_time AT TIME ZONE 'Asia/Jakarta')::DATE + TIME '16:00'
    ) AT TIME ZONE 'Asia/Jakarta',
    updated_at = now()
WHERE route_id = '3b450ef7-18b5-4c41-9093-39c15dd0c005'::UUID;
