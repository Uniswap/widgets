import { Percent } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { computeRealizedPriceImpact, getPriceImpactWarning } from 'utils/prices'

export interface PriceImpact {
  percent: Percent
  warning?: 'warning' | 'error'
  toString(): string
}

export function usePriceImpact(trade?: InterfaceTrade): PriceImpact | undefined {
  return useMemo(() => {
    const marketPriceImpact = trade ? computeRealizedPriceImpact(trade) : undefined
    return marketPriceImpact
      ? {
          percent: marketPriceImpact,
          warning: getPriceImpactWarning(marketPriceImpact),
          toString: () => toHumanReadablePercent(marketPriceImpact),
        }
      : undefined
  }, [trade])
}

export function toHumanReadablePercent(priceImpact: Percent): string {
  const sign = priceImpact.lessThan(0) ? '+' : ''
  const exactFloat = (Number(priceImpact.numerator) / Number(priceImpact.denominator)) * 100
  if (exactFloat < 0.005) {
    return '0.00%'
  }
  const number = parseFloat(priceImpact.multiply(-1)?.toFixed(2))
  return `${sign}${number}%`
}
