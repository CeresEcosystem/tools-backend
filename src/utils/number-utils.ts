export function twoNonZeroDecimals(value: number): number {
  const log10 = value ? Math.floor(Math.log10(value)) : 0;
  const div = log10 < 0 ? 10 ** (1 - log10) : 100;

  return Math.round(value * div) / div;
}
