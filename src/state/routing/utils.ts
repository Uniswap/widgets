import { ONE } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core'

export function calcMinimumAmountOut(
  slippageTolerance: Percent,
  amountOut: CurrencyAmount<Currency>
): CurrencyAmount<Currency> {
  const slippageAdjustedAmountOut = new Fraction(ONE)
    .add(slippageTolerance)
    .invert()
    .multiply(amountOut.quotient).quotient
  return CurrencyAmount.fromRawAmount(amountOut.currency, slippageAdjustedAmountOut)
}
