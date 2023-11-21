export interface ChartConfigDto {
  supported_resolutions: string[];
  supports_group_request: boolean;
  supports_marks: boolean;
  supports_search: boolean;
  supports_timescale_marks: boolean;
  symbols_types: [{ name: string; value: string }];
  supports_time: boolean;
}
