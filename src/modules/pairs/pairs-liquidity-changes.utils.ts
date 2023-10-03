import { PairsLiquidityDeposit } from './dto/pairs-liquidity-deposit.dto';
import { PairsLiquidityWithdraw } from './dto/pairs-liquidity-withdraw.dto';

export const parsePoolXYKDepositArgs = (args: any): PairsLiquidityDeposit => {
  return {
    dexId: +BigInt(args[0]).toString(),
    inputAssetA: args[1].code,
    inputAssetB: args[2].code,
    inputADesired: BigInt(args[3]).toString(),
    inputBDesired: BigInt(args[4]).toString(),
    inputAMin: BigInt(args[5]).toString(),
    inputBMin: BigInt(args[6]).toString(),
  };
};

export const parsePoolXYKWithdrawArgs = (args: any): PairsLiquidityWithdraw => {
  return {
    dexId: +BigInt(args[0]).toString(),
    outputAssetA: args[1].code,
    outputAssetB: args[2].code,
    markerAssetDesired: BigInt(args[3]).toString(),
    outputAMin: BigInt(args[4]).toString(),
    outputBMin: BigInt(args[5]).toString(),
  };
};
