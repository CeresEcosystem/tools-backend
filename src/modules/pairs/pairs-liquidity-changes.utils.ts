import { PairLiquidityDepositDto } from './dto/pair-liquidity-deposit.dto';
import { PairLiquidityWithdrawDto } from './dto/pair-liquidity-withdraw.dto';

export const parsePoolXYKDepositArgs = (args: any): PairLiquidityDepositDto => {
  return {
    dexId: +BigInt(args[0]).toString(),
    inputAssetA: args[1].code.toString(),
    inputAssetB: args[2].code.toString(),
    inputADesired: BigInt(args[3]).toString(),
    inputBDesired: BigInt(args[4]).toString(),
    inputAMin: BigInt(args[5]).toString(),
    inputBMin: BigInt(args[6]).toString(),
  };
};

export const parsePoolXYKWithdrawArgs = (
  args: any,
): PairLiquidityWithdrawDto => {
  return {
    dexId: +BigInt(args[0]).toString(),
    outputAssetA: args[1].code.toString(),
    outputAssetB: args[2].code.toString(),
    markerAssetDesired: BigInt(args[3]).toString(),
    outputAMin: BigInt(args[4]).toString(),
    outputBMin: BigInt(args[5]).toString(),
  };
};
