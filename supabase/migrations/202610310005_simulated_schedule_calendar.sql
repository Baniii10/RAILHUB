BEGIN;

INSERT INTO public.routes (id, name, origin_station_id, destination_station_id, distance_km)
SELECT '3b450ef7-18b5-4c41-9093-39c15dd0c005'::UUID,
       'Gambir - Solo Balapan via Yogyakarta (simulasi)',
       origin.id, destination.id, 570
FROM public.stations origin
CROSS JOIN public.stations destination
WHERE origin.code = 'GMR' AND destination.code = 'SLO'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.route_stops (id, route_id, station_id, stop_order, offset_minutes, duration_minutes)
SELECT stop.id, route.id, station.id, stop.stop_order, stop.offset_minutes, stop.duration_minutes
FROM public.routes route
CROSS JOIN (VALUES
    ('c5a58788-58a4-4d69-b126-01466c0c0001'::UUID, 'GMR', 1, 0, 0),
    ('c5a58788-58a4-4d69-b126-01466c0c0002'::UUID, 'YK', 2, 420, 10),
    ('c5a58788-58a4-4d69-b126-01466c0c0003'::UUID, 'SLO', 3, 540, 0)
) AS stop(id, station_code, stop_order, offset_minutes, duration_minutes)
JOIN public.stations station ON station.code = stop.station_code
WHERE route.id = '3b450ef7-18b5-4c41-9093-39c15dd0c005'::UUID
ON CONFLICT (route_id, stop_order) DO NOTHING;

INSERT INTO public.schedules (id, train_id, route_id, departure_time, arrival_time, note)
SELECT md5(route.id::TEXT || service_date.service_date::TEXT)::UUID,
       train.id, route.id,
       ((service_date.service_date::DATE + TIME '07:00') AT TIME ZONE 'Asia/Jakarta'),
       ((service_date.service_date::DATE + TIME '16:00') AT TIME ZONE 'Asia/Jakarta'),
       'Jadwal harian simulasi RAILHUB; bukan jadwal resmi operator.'
FROM public.routes route
JOIN public.trains train ON train.train_number = 'KA 68'
CROSS JOIN LATERAL generate_series(current_date, current_date + 89, INTERVAL '1 day') AS service_date(service_date)
WHERE route.id = '3b450ef7-18b5-4c41-9093-39c15dd0c005'::UUID
  AND NOT EXISTS (
      SELECT 1 FROM public.schedules existing
      WHERE existing.route_id = route.id
        AND (existing.departure_time AT TIME ZONE 'Asia/Jakarta')::DATE = service_date.service_date::DATE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.fares (id, schedule_id, carriage_class, price, currency, note)
SELECT md5(schedule.id::TEXT || ':Eksekutif')::UUID,
       schedule.id, 'Eksekutif', 600000, 'IDR', 'SIMULASI'
FROM public.schedules schedule
WHERE schedule.route_id = '3b450ef7-18b5-4c41-9093-39c15dd0c005'::UUID
ON CONFLICT (schedule_id, carriage_class) DO NOTHING;

COMMIT;
