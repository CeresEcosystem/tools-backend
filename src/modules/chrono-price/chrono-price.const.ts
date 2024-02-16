export const PRICE_HISTORY_QUERY = `
    SELECT 
        COALESCE(array_agg(ts), '{}') AS t, 
        COALESCE(array_agg(open), '{}') AS o, COALESCE(array_agg(close), '{}') AS c, 
        COALESCE(array_agg(high), '{}') AS h, COALESCE(array_agg(low), '{}') AS l
    FROM (
        SELECT 
            extract(epoch from period) AS ts, 
            open, close, high, low
        FROM (
            SELECT 
                time_bucket(cast($1 as interval), created_at) AS period,
                first(price, created_at) AS open,
                last(price, created_at) AS close,
                max(price) AS high,
                min(price) AS low
            FROM prices
            WHERE 
                token = $2
                AND created_at >= TO_TIMESTAMP($3)
                AND created_at < TO_TIMESTAMP($4)
            GROUP BY period
            ORDER BY period DESC
            LIMIT $5 
        ) AS t1
        ORDER BY ts ASC
    ) AS t2;`;
