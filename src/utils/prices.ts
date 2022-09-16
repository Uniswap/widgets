import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { FeeAmount } from '@uniswap/v3-sdk'
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ONE_HUNDRED_PERCENT,
  ZERO_PERCENT,
} from 'constants/misc'
import { InterfaceTrade } from 'state/routing/types'

export function largerPercentValue(a?: Percent, b?: Percent) {
  if (a && b) {
    return a.greaterThan(b) ? a : b
  }
  return a || b
}

export function computeRealizedPriceImpact(trade: InterfaceTrade): Percent {
  const realizedLpFeePercent = computeRealizedLPFeePercent(trade)
  return trade.priceImpact.subtract(realizedLpFeePercent)
}

export function getPriceImpactWarning(priceImpact?: Percent): 'warning' | 'error' | undefined {
  if (priceImpact?.greaterThan(ALLOWED_PRICE_IMPACT_HIGH)) return 'error'
  if (priceImpact?.greaterThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 'warning'
  return
}

// computes realized lp fee as a percent
export function computeRealizedLPFeePercent(trade: InterfaceTrade): Percent {
  let percent: Percent

  percent = ZERO_PERCENT
  for (const swap of trade.swaps) {
    const { numerator, denominator } = swap.inputAmount.divide(trade.inputAmount)
    const overallPercent = new Percent(numerator, denominator)

    const routeRealizedLPFeePercent = overallPercent.multiply(
      ONE_HUNDRED_PERCENT.subtract(
        swap.route.pools.reduce<Percent>((currentFee: Percent, pool): Percent => {
          const fee = pool instanceof Pair ? /* V2 FeeAmount= */ FeeAmount.MEDIUM : pool.fee
          return currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(new Fraction(fee, 1_000_000)))
        }, ONE_HUNDRED_PERCENT)
      )
    )

    percent = percent.add(routeRealizedLPFeePercent)
  }

  return new Percent(percent.numerator, percent.denominator)
}

// computes price breakdown for the trade
export function computeRealizedLPFeeAmount(trade?: InterfaceTrade | null): CurrencyAmount<Currency> | undefined {
  if (trade) {
    const realizedLPFee = computeRealizedLPFeePercent(trade)

    // the amount of the input that accrues to LPs
    return CurrencyAmount.fromRawAmount(trade.inputAmount.currency, trade.inputAmount.multiply(realizedLPFee).quotient)
  }

  return undefined
}

const IMPACT_TIERS = [
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  ALLOWED_PRICE_IMPACT_LOW,
]

type WarningSeverity = 0 | 1 | 2 | 3 | 4
export function warningSeverity(priceImpact: Percent | undefined): WarningSeverity {
  if (!priceImpact) return 4
  let impact: WarningSeverity = IMPACT_TIERS.length as WarningSeverity
  for (const impactLevel of IMPACT_TIERS) {
    if (impactLevel.lessThan(priceImpact)) return impact
    impact--
  }
  return 0
}
