BEGIN;

WITH route_templates AS (
    SELECT DISTINCT ON (schedule.route_id)
        schedule.route_id,
        schedule.train_id,
        (schedule.departure_time AT TIME ZONE 'Asia/Jakarta')::TIME AS departure_time,
        schedule.arrival_time - schedule.departure_time AS travel_duration,
        schedule.id AS fare_template_id
    FROM public.schedules schedule
    WHERE schedule.route_id <> '3b450ef7-18b5-4c41-9093-39c15dd0c005'::UUID
    ORDER BY schedule.route_id, schedule.departure_time
),
service_dates AS (
    SELECT generate_series(
        current_date::TIMESTAMP,
        (current_date + 89)::TIMESTAMP,
        INTERVAL '1 day'
    )::DATE AS service_date
),
new_schedules AS (
    SELECT
        md5(template.route_id::TEXT || ':' || service_date.service_date::TEXT)::UUID AS id,
        template.route_id,
        template.train_id,
        template.fare_template_id,
        service_date.service_date,
        (service_date.service_date + template.departure_time)
            AT TIME ZONE 'Asia/Jakarta' AS departure_at,
        template.travel_duration
    FROM route_templates template
    CROSS JOIN service_dates service_date
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.schedules existing
        WHERE existing.route_id = template.route_id
          AND (existing.departure_time AT TIME ZONE 'Asia/Jakarta')::DATE = service_date.service_date
    )
)
INSERT INTO public.schedules (
    id, train_id, route_id, departure_time, arrival_time, status, note
)
SELECT
    id,
    train_id,
    route_id,
    departure_at,
    departure_at + travel_duration,
    'scheduled',
    'Jadwal harian simulasi RAILHUB; bukan jadwal resmi operator.'
FROM new_schedules
ON CONFLICT (id) DO NOTHING;

WITH route_templates AS (
    SELECT DISTINCT ON (schedule.route_id)
        schedule.route_id,
        schedule.id AS fare_template_id
    FROM public.schedules schedule
    JOIN public.fares fare ON fare.schedule_id = schedule.id
    WHERE schedule.route_id <> '3b450ef7-18b5-4c41-9093-39c15dd0c005'::UUID
    ORDER BY schedule.route_id, schedule.departure_time
),
route_fares AS (
    SELECT
        template.route_id,
        fare.carriage_class,
        fare.price,
        fare.currency
    FROM route_templates template
    JOIN public.fares fare ON fare.schedule_id = template.fare_template_id
),
target_schedules AS (
    SELECT
        schedule.id AS schedule_id,
        schedule.route_id
    FROM public.schedules schedule
    WHERE schedule.route_id <> '3b450ef7-18b5-4c41-9093-39c15dd0c005'::UUID
      AND (schedule.departure_time AT TIME ZONE 'Asia/Jakarta')::DATE
          BETWEEN current_date AND current_date + 89
),
missing_schedule_fares AS (
    SELECT
        schedule.schedule_id,
        route_fare.carriage_class,
        route_fare.price,
        route_fare.currency
    FROM target_schedules schedule
    JOIN route_fares route_fare ON route_fare.route_id = schedule.route_id
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.fares existing_fare
        WHERE existing_fare.schedule_id = schedule.schedule_id
          AND existing_fare.carriage_class = route_fare.carriage_class
    )
)
INSERT INTO public.fares (id, schedule_id, carriage_class, price, currency, note)
SELECT
    md5(missing_fare.schedule_id::TEXT || ':' || missing_fare.carriage_class::TEXT)::UUID,
    missing_fare.schedule_id,
    missing_fare.carriage_class,
    missing_fare.price,
    missing_fare.currency,
    'SIMULASI'
FROM missing_schedule_fares missing_fare
ON CONFLICT (schedule_id, carriage_class) DO NOTHING;

COMMIT;
