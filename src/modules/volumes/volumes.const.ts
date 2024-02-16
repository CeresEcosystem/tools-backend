export const VOLUMES_HISTORY_QUERY = `
    SELECT 
        COALESCE(array_agg(ts), '{}') AS t, 
        COALESCE(array_agg(volume), '{}') AS v
    FROM (
        SELECT 
            extract(epoch from period) AS ts, 
            volume
        FROM (
            SELECT 
                time_bucket(cast($1 as interval), volume_at) AS period,
                SUM(COALESCE(volume, 0)) AS volume
            FROM volumes
            WHERE 
                token = $2
                AND volume_at >= TO_TIMESTAMP($3)
                AND volume_at < TO_TIMESTAMP($4)
            GROUP BY period
            ORDER BY period DESC
            LIMIT $5
        ) AS t1
        ORDER BY ts ASC
    ) AS t2;`;

export const MINUTES_ELAPSED_SINCE_LAST_VOLUME_QUERY = `
    SELECT ROUND(EXTRACT(EPOCH FROM( 
        (now() - (
            SELECT COALESCE(MAX(volume_at), NOW() - INTERVAL '5 MINUTES') 
            FROM volumes
        ))
    )) / 60) AS minutes;`;
