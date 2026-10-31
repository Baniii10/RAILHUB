BEGIN;

WITH carriage_inventory AS (
    SELECT
        carriage.id AS carriage_id,
        COUNT(seat.id)::INTEGER AS seat_count,
        COALESCE(BOOL_OR(seat.seat_number ~ '^[0-9]+[A-D]$'), FALSE) AS uses_lettered_seats
    FROM public.carriages carriage
    LEFT JOIN public.seats seat ON seat.carriage_id = carriage.id
    GROUP BY carriage.id
),
seat_candidates AS (
    SELECT
        inventory.carriage_id,
        seat_row.row_number::TEXT || seat_column.column_letter AS seat_number
    FROM carriage_inventory inventory
    CROSS JOIN generate_series(1, 10) AS seat_row(row_number)
    CROSS JOIN (
        VALUES ('A'::TEXT), ('B'::TEXT), ('C'::TEXT), ('D'::TEXT)
    ) AS seat_column(column_letter)
    WHERE inventory.seat_count < 40
      AND inventory.uses_lettered_seats

    UNION ALL

    SELECT inventory.carriage_id, seat_row.row_number::TEXT AS seat_number
    FROM carriage_inventory inventory
    CROSS JOIN generate_series(1, 40) AS seat_row(row_number)
    WHERE inventory.seat_count < 40
      AND NOT inventory.uses_lettered_seats
),
missing_seats AS (
    SELECT
        candidate.carriage_id,
        candidate.seat_number,
        inventory.seat_count,
        ROW_NUMBER() OVER (
            PARTITION BY candidate.carriage_id
            ORDER BY candidate.seat_number
        ) AS missing_seat_index
    FROM seat_candidates candidate
    JOIN carriage_inventory inventory ON inventory.carriage_id = candidate.carriage_id
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.seats existing
        WHERE existing.carriage_id = candidate.carriage_id
          AND existing.seat_number = candidate.seat_number
    )
)
INSERT INTO public.seats (id, carriage_id, seat_number)
SELECT gen_random_uuid(), missing.carriage_id, missing.seat_number
FROM missing_seats missing
WHERE missing.missing_seat_index <= 40 - missing.seat_count
ON CONFLICT DO NOTHING;

COMMIT;
