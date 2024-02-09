export const PRICE_HISTORY_QUERY = `
    SELECT 
        array_agg(ts) AS t, 
        array_agg(open) AS o, array_agg(close) AS c, 
        array_agg(high) AS h, array_agg(low) AS l
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

export const AVG_PRICE_IN_FIVE_MINUTES_QUERY = `
    SELECT 
        token,
        AVG(price) AS average_price
    FROM 
        prices 
    WHERE 
        token = $1
    GROUP BY 
        token
    LIMIT 
        5;`;
