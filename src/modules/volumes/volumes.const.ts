export const VOLUMES_HISTORY_QUERY = `
    SELECT 
        array_agg(ts) AS t, 
        array_agg(volume) AS v
    FROM (
        SELECT 
            extract(epoch from period) AS ts, 
            volume
        FROM (
            SELECT 
                time_bucket(cast($1 as interval), created_at) AS period,
                SUM(volume) AS volume
            FROM volumes
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
