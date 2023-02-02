import { Percent } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { FeeAmount, Pool } from '@uniswap/v3-sdk'
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
} from 'constants/misc'

export function largerPercentValue(a?: Percent, b?: Percent) {
  if (a && b) {
    return a.greaterThan(b) ? a : b
  }
  return a || b
}

export function getPriceImpactWarning(priceImpact: Percent): 'warning' | 'error' | undefined {
  if (priceImpact.greaterThan(ALLOWED_PRICE_IMPACT_HIGH)) return 'error'
  if (priceImpact.greaterThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 'warning'
  return
}

export function getFeeAmount(pool: Pair | Pool): FeeAmount {
  // Pair's (ie V2) FeeAmounts are always equivalent to FeeAmount.MEDIUM: 30 bips.
  if (pool instanceof Pair) return FeeAmount.MEDIUM
  return pool.fee
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
