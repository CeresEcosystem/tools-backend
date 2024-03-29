/* eslint-disable camelcase */
import { ChartConfigDto } from './dto/chart-config-dto';

export const CHART_SUPPORTED_RESOLUTIONS = ['5', '15', '30', '60', '4h', 'D'];

export const CHART_CONFIG: ChartConfigDto = {
  supported_resolutions: CHART_SUPPORTED_RESOLUTIONS,
  supports_group_request: false,
  supports_marks: false,
  supports_search: true,
  supports_timescale_marks: false,
  symbols_types: [{ name: 'Crypto', value: 'crypto' }],
  supports_time: true,
};
