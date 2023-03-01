const SUPPORTED_RESOLUTIONS = ['5', '15', '30', '60', '4h'];

export const CHART_CONFIG = {
  supported_resolutions: SUPPORTED_RESOLUTIONS,
  supports_group_request: false,
  supports_marks: false,
  supports_search: true,
  supports_timescale_marks: false,
  symbols_types: [{ name: 'Crypto', value: 'crypto' }],
  supports_time: true,
};

export const SYMBOL_EXTENSION = {
  intraday_multipliers: SUPPORTED_RESOLUTIONS,
  supported_resolutions: SUPPORTED_RESOLUTIONS,
  session: '24x7',
  has_intraday: true,
  has_no_volume: true,
  has_weekly_and_monthly: false,
  has_daily: false,
};
