import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core'
import { Pair, Trade as V2Trade } from '@uniswap/v2-sdk'
import { FeeAmount, Pool } from '@uniswap/v3-sdk'
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ONE_HUNDRED_PERCENT,
  ZERO_PERCENT,
} from 'constants/misc'
import JSBI from 'jsbi'
import { InterfaceTrade } from 'state/routing/types'

const V2_FEE_PERCENT = new Percent(FeeAmount.MEDIUM, JSBI.BigInt(1_000_000))
const V2_INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(V2_FEE_PERCENT)

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

  if (trade instanceof V2Trade) {
    // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
    // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
    percent = ONE_HUNDRED_PERCENT.subtract(
      trade.route.pairs.reduce<Percent>(
        (currentFee: Percent): Percent => currentFee.multiply(V2_INPUT_FRACTION_AFTER_FEE),
        ONE_HUNDRED_PERCENT
      )
    )
  } else {
    percent = ZERO_PERCENT
    for (const swap of trade.swaps) {
      const { numerator, denominator } = swap.inputAmount.divide(trade.inputAmount)
      const overallPercent = new Percent(numerator, denominator)

      const routeRealizedLPFeePercent = overallPercent.multiply(
        ONE_HUNDRED_PERCENT.subtract(
          (swap.route.pools as (Pair | Pool)[]).reduce<Percent>((currentFee: Percent, pool: Pair | Pool): Percent => {
            const fee = pool instanceof Pair ? FeeAmount.MEDIUM : pool.fee
            return currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(new Fraction(fee, 1_000_000)))
          }, ONE_HUNDRED_PERCENT)
        )
      )

      percent = percent.add(routeRealizedLPFeePercent)
    }
  }

  return new Percent(percent.numerator, percent.denominator)
}

// computes price breakdown for the trade
export function computeRealizedLPFeeAmount(trade?: InterfaceTrade): CurrencyAmount<Currency> | undefined {
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
