BEGIN;

CREATE TEMP TABLE railhub_station_catalog (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6)
) ON COMMIT DROP;

INSERT INTO railhub_station_catalog (code, name, city, province, latitude, longitude)
VALUES
    ('CLG', 'Cilegon', 'KOTA CILEGON', 'Banten', -6.019619, 106.053124),
    ('LPN', 'Lempuyangan d.h. Djocja Lempoejangan', 'KOTA YOGYAKARTA', 'DI Yogyakarta', NULL, NULL),
    ('WT', 'Wates (Kulon Progo)', 'KULON PROGO', 'DI Yogyakarta', NULL, NULL),
    ('YK', 'Yogyakarta d.h. Djocja Toegoe, Djokjakarta', 'KOTA YOGYAKARTA', 'DI Yogyakarta', NULL, NULL),
    ('GMR', 'Gambir d.h. Weltevreden, Batavia-koningsplein', 'JAKARTA', 'DKI Jakarta', NULL, NULL),
    ('MRI', 'Manggarai', 'KOTA JAKARTA PUSAT', 'DKI Jakarta', -6.2099, 106.85),
    ('PSE', 'Pasar Senen', 'JAKARTA', 'DKI Jakarta', -6.173611, 106.844167),
    ('AWN', 'Arjawinangun', 'KABUPATEN CIREBON', 'Jawa Barat', -6.64472, 108.414),
    ('BD', 'Bandung', 'KOTA BANDUNG', 'Jawa Barat', -6.914167, 107.6025),
    ('BJR', 'Banjar', 'KOTA BANJAR', 'Jawa Barat', -7.376278, 108.542389),
    ('BTT', 'Batutulis', 'KABUPATEN BOGOR', 'Jawa Barat', -6.625933, 106.809544),
    ('BOP', 'Bogor Paledang', 'KOTA BOGOR', 'Jawa Barat', -6.597889, 106.790544),
    ('CI', 'Ciamis', 'KABUPATEN CIAMIS', 'Jawa Barat', -7.329167, 108.355917),
    ('CBD', 'Cibadak', 'KOTA SUKABUMI', 'Jawa Barat', -6.888333, 106.780444),
    ('CB', 'Cibatu', 'KABUPATEN GARUT', 'Jawa Barat', -7.100115, 107.979467),
    ('CCL', 'Cicalengka', 'KABUPATEN BANDUNG', 'Jawa Barat', -6.981348, 107.832581),
    ('CCR', 'Cicurug', 'KOTA SUKABUMI', 'Jawa Barat', -6.790444, 106.779666),
    ('CGB', 'Cigombong', 'KABUPATEN BOGOR', 'Jawa Barat', -6.742333, 106.803111),
    ('CKP', 'Cikampek', 'KABUPATEN KARAWANG', 'Jawa Barat', -6.406041, 107.45904),
    ('CN', 'Cirebon d.h. Cheribon SS', 'KOTA CIREBON', 'Jawa Barat', NULL, NULL),
    ('BTG', 'Batang', 'KABUPATEN BATANG', 'Jawa Tengah', -6.909961, 109.747636),
    ('BB', 'Brebes', 'KABUPATEN BREBES', 'Jawa Tengah', -6.87417, 109.043),
    ('BMA', 'Bumiayu', 'KABUPATEN BREBES', 'Jawa Tengah', -7.2375, 109.01),
    ('CP', 'Cilacap', 'KABUPATEN CILACAP', 'Jawa Tengah', -7.736093, 109.006938),
    ('CO', 'Comal', 'KABUPATEN PEMALANG', 'Jawa Tengah', -6.909186, 109.536819),
    ('DPL', 'Doplang', 'KABUPATEN BLORA', 'Jawa Tengah', -7.18294, 111.288),
    ('GBN', 'Gambringan', 'KABUPATEN GROBOGAN', 'Jawa Tengah', -7.14394, 110.915),
    ('GDM', 'Gandrungmangun', 'KABUPATEN CILACAP', 'Jawa Tengah', -7.528287, 108.859186),
    ('GB', 'Gombong', 'KABUPATEN KEBUMEN', 'Jawa Tengah', -7.610822, 109.506871),
    ('GM', 'Gumilir', 'KABUPATEN CILACAP', 'Jawa Tengah', -7.68516, 109.042),
    ('GD', 'Gundih', 'KABUPATEN GROBOGAN', 'Jawa Tengah', -7.218755, 110.899937),
    ('PWT', 'Purwokerto d.h. Poerwokerto SS, Poerwokerto-West', 'PURWOKERTO', 'Jawa Tengah', NULL, NULL),
    ('SMT', 'Semarang Tawang d.h. Tawang NIS, Semarang NIS [ k ]', 'KOTA SEMARANG', 'Jawa Tengah', NULL, NULL),
    ('SLO', 'Solo Balapan', 'KOTA SOLO', 'Jawa Tengah', -7.556755, 110.821399),
    ('AJ', 'Arjasa', 'KABUPATEN JEMBER', 'Jawa Timur', -8.129449, 113.742813),
    ('BBT', 'Babat', 'KABUPATEN LAMONGAN', 'Jawa Timur', -7.10611, 112.169),
    ('BG', 'Bangil', 'KOTA PASURUAN', 'Jawa Timur', -7.59889, 112.778),
    ('BL', 'Blitar', 'KOTA BLITAR', 'Jawa Timur', -8.101389, 112.163056),
    ('CRB', 'Caruban', 'KOTA MADIUN', 'Jawa Timur', -7.551121, 111.654785),
    ('CRM', 'Curahmalang', 'KABUPATEN JOMBANG', 'Jawa Timur', -7.50667, 112.371),
    ('GG', 'Geneng', 'KABUPATEN NGAWI', 'Jawa Timur', -7.498031, 111.418533),
    ('GLM', 'Glenmore', 'KABUPATEN BANYUWANGI', 'Jawa Timur', -8.29957, 114.049),
    ('JR', 'Jember', 'KABUPATEN JEMBER', 'Jawa Timur', -8.16583, 113.702),
    ('JG', 'Jombang', 'KABUPATEN JOMBANG', 'Jawa Timur', -7.558105, 112.233494),
    ('KBR', 'Kalibaru', 'KABUPATEN BANYUWANGI', 'Jawa Timur', -8.28884, 113.984439),
    ('KLT', 'Kalisat', 'KABUPATEN JEMBER', 'Jawa Timur', -8.12694, 113.812),
    ('KLS', 'Kalisetail', 'KABUPATEN BANYUWANGI', 'Jawa Timur', -8.30278, 114.14),
    ('KD', 'Kediri', 'KOTA KEDIRI', 'Jawa Timur', -7.81725, 112.015648),
    ('MN', 'Madiun', 'KOTA MADIUN', 'Jawa Timur', -7.618833, 111.52438),
    ('SGU', 'Surabaya Gubeng', 'KOTA SURABAYA', 'Jawa Timur', -7.26532, 112.75269);

UPDATE public.stations
SET is_bookable_in_simulation = false
WHERE is_bookable_in_simulation;

INSERT INTO public.stations (
    code, name, original_name, city, province, latitude, longitude,
    service_type, operational_status, verification_status,
    is_bookable_in_simulation, source_url, verified_at
)
SELECT
    catalog.code, catalog.name, catalog.name, catalog.city, catalog.province,
    catalog.latitude, catalog.longitude, 'intercity', 'active', 'verified',
    false,
    'https://raw.githubusercontent.com/fajriyan/open-data/master/data-nasional/transportasi/infrastruktur/stasiun-kereta-indonesia.json',
    DATE '2026-10-28'
FROM railhub_station_catalog catalog
WHERE NOT EXISTS (
    SELECT 1 FROM public.stations existing WHERE existing.code = catalog.code
);

WITH ranked_stations AS (
    SELECT
        station.id,
        catalog.code,
        catalog.name,
        catalog.city,
        catalog.province,
        catalog.latitude,
        catalog.longitude,
        ROW_NUMBER() OVER (
            PARTITION BY catalog.code
            ORDER BY
                station.is_bookable_in_simulation DESC,
                (station.service_type = 'intercity') DESC,
                (station.operational_status = 'active') DESC,
                (station.verification_status = 'verified') DESC,
                (station.name = catalog.name) DESC,
                station.created_at,
                station.id
        ) AS station_rank
    FROM railhub_station_catalog catalog
    JOIN public.stations station ON station.code = catalog.code
)
UPDATE public.stations station
SET name = COALESCE(NULLIF(station.name, ''), ranked.name),
    original_name = COALESCE(station.original_name, ranked.name),
    city = COALESCE(station.city, ranked.city),
    province = ranked.province,
    latitude = COALESCE(station.latitude, ranked.latitude),
    longitude = COALESCE(station.longitude, ranked.longitude),
    service_type = 'intercity',
    operational_status = 'active',
    verification_status = 'verified',
    is_bookable_in_simulation = true,
    source_url = COALESCE(
        station.source_url,
        'https://raw.githubusercontent.com/fajriyan/open-data/master/data-nasional/transportasi/infrastruktur/stasiun-kereta-indonesia.json'
    ),
    verified_at = COALESCE(station.verified_at, DATE '2026-10-28'),
    updated_at = now()
FROM ranked_stations ranked
WHERE station.id = ranked.id
  AND ranked.station_rank = 1;

WITH selected_stations AS (
    SELECT
        station.id,
        station.code,
        station.name,
        station.province,
        station.latitude,
        station.longitude
    FROM railhub_station_catalog catalog
    JOIN public.stations station ON station.code = catalog.code
    WHERE station.is_bookable_in_simulation
),
station_hubs AS (
    SELECT station.*, CASE station.province
        WHEN 'DKI Jakarta' THEN 'GMR'
        WHEN 'Banten' THEN 'GMR'
        WHEN 'Jawa Barat' THEN 'BD'
        WHEN 'Jawa Tengah' THEN 'SMT'
        WHEN 'DI Yogyakarta' THEN 'YK'
        WHEN 'Jawa Timur' THEN 'SGU'
    END AS hub_code
    FROM selected_stations station
),
hub_routes AS (
    SELECT spoke.id AS spoke_id, hub.id AS hub_id, spoke.code AS spoke_code,
           hub.code AS hub_code, spoke.name AS spoke_name, hub.name AS hub_name,
           COALESCE(spoke.latitude, catalog_spoke.latitude) AS spoke_latitude,
           COALESCE(spoke.longitude, catalog_spoke.longitude) AS spoke_longitude,
           COALESCE(hub.latitude, catalog_hub.latitude) AS hub_latitude,
           COALESCE(hub.longitude, catalog_hub.longitude) AS hub_longitude
    FROM station_hubs spoke
    JOIN selected_stations hub ON hub.code = spoke.hub_code
    JOIN railhub_station_catalog catalog_spoke ON catalog_spoke.code = spoke.code
    JOIN railhub_station_catalog catalog_hub ON catalog_hub.code = hub.code
    WHERE spoke.code <> spoke.hub_code
),
directed_routes AS (
    SELECT spoke_id AS origin_id, hub_id AS destination_id,
           spoke_code AS origin_code, hub_code AS destination_code,
           spoke_name AS origin_name, hub_name AS destination_name,
           spoke_latitude AS origin_latitude, spoke_longitude AS origin_longitude,
           hub_latitude AS destination_latitude, hub_longitude AS destination_longitude,
           hub_code
    FROM hub_routes
    UNION ALL
    SELECT hub_id, spoke_id, hub_code, spoke_code, hub_name, spoke_name,
           hub_latitude, hub_longitude, spoke_latitude, spoke_longitude, hub_code
    FROM hub_routes
),
route_values AS (
    SELECT
        md5('railhub-station-network:' || origin_code || ':' || destination_code)::UUID AS id,
        origin_id,
        destination_id,
        origin_name || ' - ' || destination_name || ' (simulasi)' AS name,
        hub_code,
        CASE
            WHEN origin_latitude IS NULL OR origin_longitude IS NULL
              OR destination_latitude IS NULL OR destination_longitude IS NULL
            THEN 80::NUMERIC
            ELSE GREATEST(
                20::NUMERIC,
                ROUND((6371 * 2 * ASIN(SQRT(
                    POWER(SIN(RADIANS(destination_latitude - origin_latitude) / 2), 2)
                    + COS(RADIANS(origin_latitude)) * COS(RADIANS(destination_latitude))
                    * POWER(SIN(RADIANS(destination_longitude - origin_longitude) / 2), 2)
                )) * 1.25)::NUMERIC, 2)
            )
        END AS distance_km
    FROM directed_routes
)
INSERT INTO public.routes (id, name, origin_station_id, destination_station_id, distance_km)
SELECT
    route.id, route.name, route.origin_id, route.destination_id, route.distance_km
FROM route_values route
WHERE NOT EXISTS (
    SELECT 1 FROM public.routes existing
    WHERE existing.origin_station_id = route.origin_id
      AND existing.destination_station_id = route.destination_id
)
ON CONFLICT (id) DO NOTHING;

WITH selected_stations AS (
    SELECT station.id, station.code, station.name, station.province,
           station.latitude, station.longitude
    FROM railhub_station_catalog catalog
    JOIN public.stations station ON station.code = catalog.code
    WHERE station.is_bookable_in_simulation
),
station_hubs AS (
    SELECT station.*, CASE station.province
        WHEN 'DKI Jakarta' THEN 'GMR'
        WHEN 'Banten' THEN 'GMR'
        WHEN 'Jawa Barat' THEN 'BD'
        WHEN 'Jawa Tengah' THEN 'SMT'
        WHEN 'DI Yogyakarta' THEN 'YK'
        WHEN 'Jawa Timur' THEN 'SGU'
    END AS hub_code
    FROM selected_stations station
),
hub_routes AS (
    SELECT spoke.id AS spoke_id, hub.id AS hub_id, spoke.code AS spoke_code,
           hub.code AS hub_code, spoke.name AS spoke_name, hub.name AS hub_name,
           COALESCE(spoke.latitude, catalog_spoke.latitude) AS spoke_latitude,
           COALESCE(spoke.longitude, catalog_spoke.longitude) AS spoke_longitude,
           COALESCE(hub.latitude, catalog_hub.latitude) AS hub_latitude,
           COALESCE(hub.longitude, catalog_hub.longitude) AS hub_longitude
    FROM station_hubs spoke
    JOIN selected_stations hub ON hub.code = spoke.hub_code
    JOIN railhub_station_catalog catalog_spoke ON catalog_spoke.code = spoke.code
    JOIN railhub_station_catalog catalog_hub ON catalog_hub.code = hub.code
    WHERE spoke.code <> spoke.hub_code
),
directed_routes AS (
    SELECT spoke_id AS origin_id, hub_id AS destination_id,
           spoke_code AS origin_code, hub_code AS destination_code,
           spoke_name AS origin_name, hub_name AS destination_name,
           spoke_latitude AS origin_latitude, spoke_longitude AS origin_longitude,
           hub_latitude AS destination_latitude, hub_longitude AS destination_longitude,
           hub_code
    FROM hub_routes
    UNION ALL
    SELECT hub_id, spoke_id, hub_code, spoke_code, hub_name, spoke_name,
           hub_latitude, hub_longitude, spoke_latitude, spoke_longitude, hub_code
    FROM hub_routes
),
route_values AS (
    SELECT
        md5('railhub-station-network:' || origin_code || ':' || destination_code)::UUID AS id,
        origin_id,
        destination_id,
        origin_name || ' - ' || destination_name || ' (simulasi)' AS name,
        hub_code,
        CASE
            WHEN origin_latitude IS NULL OR origin_longitude IS NULL
              OR destination_latitude IS NULL OR destination_longitude IS NULL
            THEN 80::NUMERIC
            ELSE GREATEST(
                20::NUMERIC,
                ROUND((6371 * 2 * ASIN(SQRT(
                    POWER(SIN(RADIANS(destination_latitude - origin_latitude) / 2), 2)
                    + COS(RADIANS(origin_latitude)) * COS(RADIANS(destination_latitude))
                    * POWER(SIN(RADIANS(destination_longitude - origin_longitude) / 2), 2)
                )) * 1.25)::NUMERIC, 2)
            )
        END AS distance_km
    FROM directed_routes
),
network_routes AS (
    SELECT route.*
    FROM route_values route
    JOIN public.routes existing ON existing.id = route.id
)
INSERT INTO public.route_stops (id, route_id, station_id, stop_order, offset_minutes, duration_minutes)
SELECT
    md5(route.id::TEXT || ':' || stop.station_id::TEXT)::UUID,
    route.id,
    stop.station_id,
    stop.stop_order,
    stop.offset_minutes,
    stop.duration_minutes
FROM network_routes route
CROSS JOIN LATERAL (
    VALUES (route.origin_id, 1, 0, 0),
           (route.destination_id, 2, GREATEST(30, ROUND(route.distance_km)::INTEGER), 0)
) AS stop(station_id, stop_order, offset_minutes, duration_minutes)
ON CONFLICT (route_id, station_id) DO NOTHING;

WITH selected_stations AS (
    SELECT station.id, station.code, station.name, station.province,
           station.latitude, station.longitude
    FROM railhub_station_catalog catalog
    JOIN public.stations station ON station.code = catalog.code
    WHERE station.is_bookable_in_simulation
),
station_hubs AS (
    SELECT station.*, CASE station.province
        WHEN 'DKI Jakarta' THEN 'GMR'
        WHEN 'Banten' THEN 'GMR'
        WHEN 'Jawa Barat' THEN 'BD'
        WHEN 'Jawa Tengah' THEN 'SMT'
        WHEN 'DI Yogyakarta' THEN 'YK'
        WHEN 'Jawa Timur' THEN 'SGU'
    END AS hub_code
    FROM selected_stations station
),
hub_routes AS (
    SELECT spoke.id AS spoke_id, hub.id AS hub_id, spoke.code AS spoke_code,
           hub.code AS hub_code, spoke.name AS spoke_name, hub.name AS hub_name,
           COALESCE(spoke.latitude, catalog_spoke.latitude) AS spoke_latitude,
           COALESCE(spoke.longitude, catalog_spoke.longitude) AS spoke_longitude,
           COALESCE(hub.latitude, catalog_hub.latitude) AS hub_latitude,
           COALESCE(hub.longitude, catalog_hub.longitude) AS hub_longitude
    FROM station_hubs spoke
    JOIN selected_stations hub ON hub.code = spoke.hub_code
    JOIN railhub_station_catalog catalog_spoke ON catalog_spoke.code = spoke.code
    JOIN railhub_station_catalog catalog_hub ON catalog_hub.code = hub.code
    WHERE spoke.code <> spoke.hub_code
),
directed_routes AS (
    SELECT spoke_id AS origin_id, hub_id AS destination_id,
           spoke_code AS origin_code, hub_code AS destination_code,
           spoke_name AS origin_name, hub_name AS destination_name,
           spoke_latitude AS origin_latitude, spoke_longitude AS origin_longitude,
           hub_latitude AS destination_latitude, hub_longitude AS destination_longitude,
           hub_code
    FROM hub_routes
    UNION ALL
    SELECT hub_id, spoke_id, hub_code, spoke_code, hub_name, spoke_name,
           hub_latitude, hub_longitude, spoke_latitude, spoke_longitude, hub_code
    FROM hub_routes
),
route_values AS (
    SELECT
        md5('railhub-station-network:' || origin_code || ':' || destination_code)::UUID AS id,
        origin_id,
        destination_id,
        hub_code,
        CASE
            WHEN origin_latitude IS NULL OR origin_longitude IS NULL
              OR destination_latitude IS NULL OR destination_longitude IS NULL
            THEN 80::NUMERIC
            ELSE GREATEST(
                20::NUMERIC,
                ROUND((6371 * 2 * ASIN(SQRT(
                    POWER(SIN(RADIANS(destination_latitude - origin_latitude) / 2), 2)
                    + COS(RADIANS(origin_latitude)) * COS(RADIANS(destination_latitude))
                    * POWER(SIN(RADIANS(destination_longitude - origin_longitude) / 2), 2)
                )) * 1.25)::NUMERIC, 2)
            )
        END AS distance_km
    FROM directed_routes
),
network_services AS (
    SELECT
        route.id AS route_id,
        route.distance_km,
        train.id AS train_id
    FROM route_values route
    JOIN public.routes existing_route ON existing_route.id = route.id
    JOIN public.trains train ON train.train_number = CASE route.hub_code
        WHEN 'GMR' THEN 'KA 1'
        WHEN 'BD' THEN 'KA 34'
        WHEN 'SMT' THEN 'KA 1'
        WHEN 'YK' THEN 'KA 68'
        WHEN 'SGU' THEN 'KA 6'
    END
),
service_dates AS (
    SELECT generate_series(
        (now() AT TIME ZONE 'Asia/Jakarta')::DATE::TIMESTAMP,
        (now() AT TIME ZONE 'Asia/Jakarta')::DATE::TIMESTAMP + INTERVAL '89 days',
        INTERVAL '1 day'
    )::DATE AS service_date
),
new_schedules AS (
    SELECT
        md5(service.route_id::TEXT || ':' || service_date.service_date::TEXT)::UUID AS id,
        service.route_id,
        service.train_id,
        service.distance_km,
        service_date.service_date,
        ((service_date.service_date + TIME '07:00') AT TIME ZONE 'Asia/Jakarta') AS departure_time
    FROM network_services service
    CROSS JOIN service_dates service_date
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.schedules existing
        WHERE existing.route_id = service.route_id
          AND (existing.departure_time AT TIME ZONE 'Asia/Jakarta')::DATE = service_date.service_date
    )
)
INSERT INTO public.schedules (id, train_id, route_id, departure_time, arrival_time, status, note)
SELECT
    schedule.id,
    schedule.train_id,
    schedule.route_id,
    schedule.departure_time,
    schedule.departure_time + make_interval(
        mins => GREATEST(30, ROUND(schedule.distance_km)::INTEGER)
    ),
    'scheduled',
    'Jadwal penghubung simulasi RAILHUB; bukan jadwal resmi operator.'
FROM new_schedules schedule
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.fares (id, schedule_id, carriage_class, price, currency, note)
SELECT
    md5(schedule.id::TEXT || ':' || carriage.carriage_class::TEXT)::UUID,
    schedule.id,
    carriage.carriage_class,
    GREATEST(
        50000,
        ROUND(schedule.distance_km * CASE
            WHEN carriage.carriage_class::TEXT = 'Ekonomi' THEN 800
            ELSE 1400
        END / 1000) * 1000
    ),
    'IDR',
    'Tarif simulasi RAILHUB; bukan tarif resmi operator.'
FROM (
    SELECT
        schedule.id,
        schedule.train_id,
        route.distance_km
    FROM public.schedules schedule
    JOIN public.routes route ON route.id = schedule.route_id
    WHERE route.name LIKE '% (simulasi)'
) schedule
JOIN public.carriages carriage ON carriage.train_id = schedule.train_id
GROUP BY schedule.id, schedule.train_id, schedule.distance_km, carriage.carriage_class
ON CONFLICT (schedule_id, carriage_class) DO NOTHING;

COMMIT;
