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

export const PRICE_HISTORY_QUERY_ALL_TOKENS = `
    SELECT 
        token, period as period_date, extract(epoch from period) AS period_epoch, 
        open, close, high, low
    FROM (
        SELECT 
            token,
            time_bucket(cast($1 as interval), created_at) AS period,
            first(price, created_at) AS open,
            last(price, created_at) AS close,
            max(price) AS high,
            min(price) AS low
        FROM prices
        WHERE 
            created_at >= TO_TIMESTAMP($2)
            AND created_at < TO_TIMESTAMP($3)
        GROUP BY token, period
        ORDER BY period ASC
    ) AS t1;`;

export const PRICE_HISTORY_CACHE_QUERY = `
    SELECT
        COALESCE(array_agg(period_epoch), '{}') AS t,
        COALESCE(array_agg(open), '{}') AS o, COALESCE(array_agg(close), '{}') AS c,
        COALESCE(array_agg(high), '{}') AS h, COALESCE(array_agg(low), '{}') AS l
    FROM (
        SELECT *
        FROM (
            SELECT * FROM prices_agg
            WHERE
                resolution = $1
                AND token = $2
                AND period_epoch >= $3
                AND period_epoch < $4
            ORDER BY period_epoch DESC
            LIMIT $5
        ) AS t1
        ORDER BY period_epoch ASC
    ) AS t2;`;
