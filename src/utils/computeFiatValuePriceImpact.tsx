import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { ONE_HUNDRED_PERCENT } from 'constants/misc'
import JSBI from 'jsbi'

export function computeFiatValuePriceImpact(
  fiatValueInput: CurrencyAmount<Currency> | undefined | null,
  fiatValueOutput: CurrencyAmount<Currency> | undefined | null
): Percent | undefined {
  if (!fiatValueOutput || !fiatValueInput) return undefined
  if (!fiatValueInput.currency.equals(fiatValueOutput.currency)) return undefined
  if (JSBI.equal(fiatValueInput.quotient, JSBI.BigInt(0))) return undefined
  // Example when output is greater than input:
  // 1 - (100 / 80) = 1 - 1.25 = -0.25 = 25% profit (positive)
  // Example when output is less than input:
  // 1 - (80 / 100) = 1 - 0.8 = 0.2 = 20% loss (negative)
  const pct = ONE_HUNDRED_PERCENT.subtract(fiatValueOutput.divide(fiatValueInput)).multiply(-1)
  return new Percent(pct.numerator, pct.denominator)
}
