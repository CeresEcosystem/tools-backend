export const CACHE_KEYS = {
  PORTFOLIO: 'portfolio',
  LIQUIDITY_PORTFOLIO: 'liquidity-portfolio',
  REWARDS_PORTFOLIO: 'rewards-portfolio',
  STAKING_PORTFOLIO: 'staking-portfolio',
};

export const CACHE_TTL = {
  FIVE_MINUTES: 5 * 60 * 1000,
};

export const PORTFOLIO_VALUE_HISTORY_QUERY = `
        SELECT
            extract(epoch from period) AS time, value
        FROM (
            SELECT
                time_bucket(cast($1 as interval), created_at) AS period,
                last(value, created_at) AS value
            FROM portfolio_value
            WHERE
                account_id = $2
                AND created_at >= TO_TIMESTAMP($3)
                AND created_at < TO_TIMESTAMP($4)
            GROUP BY period
            ORDER BY period ASC
        ) AS t1;`;
