import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { computeRealizedPriceImpact, getPriceImpactWarning, largerPercentValue } from 'utils/prices'

export interface PriceImpact {
  percent: Percent
  warning?: 'warning' | 'error'
  toString(): string
}

export function usePriceImpact(
  trade: InterfaceTrade | undefined,
  {
    inputUSDCValue,
    outputUSDCValue,
  }: { inputUSDCValue: CurrencyAmount<Token> | undefined; outputUSDCValue: CurrencyAmount<Token> | undefined }
) {
  return useMemo(() => {
    const fiatPriceImpact = computeFiatValuePriceImpact(inputUSDCValue, outputUSDCValue)
    const marketPriceImpact = trade ? computeRealizedPriceImpact(trade) : undefined
    if (!fiatPriceImpact && !marketPriceImpact) {
      return undefined
    }
    const percent = largerPercentValue(marketPriceImpact, fiatPriceImpact)
    return percent
      ? {
          percent,
          warning: getPriceImpactWarning(percent),
          toString: () => toHumanReadablePercent(percent),
        }
      : undefined
  }, [inputUSDCValue, outputUSDCValue, trade])
}

export function toHumanReadablePercent(priceImpact: Percent): string {
  const sign = priceImpact.lessThan(0) ? '+' : ''
  const number = parseFloat(priceImpact.multiply(-1)?.toSignificant(3))
  return `${sign}${number}%`
}
