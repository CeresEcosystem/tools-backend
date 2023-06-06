export interface TrackerBlockDto {
  blockNum: number;
  grossBurn: string;
  netBurn: string;
  remintedLp: string;
  remintedParliament: string;
  xorSpent: string;

  //FIXME: Deprecated fields
  pswapGrossBurn: string;
  pswapNetBurn: string;
  pswapRemintedLp: string;
  pswapRemintedParliament: string;
}
