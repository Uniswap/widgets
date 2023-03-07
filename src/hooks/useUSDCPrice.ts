import { Currency, CurrencyAmount, Price, Token, TradeType } from '@uniswap/sdk-core'
import { useAtom } from 'jotai'
import { useMemo, useRef } from 'react'
import { routerPreferenceAtom } from 'state/swap/settings'

import { QuoteType } from './routing/types'
import { useRouterTrade } from './routing/useRouterTrade'
import { STABLECOIN_AMOUNT_OUT } from './useStablecoinAmountFromFiatValue'

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(currency?: Currency): Price<Currency, Token> | undefined {
  const chainId = currency?.chainId

  const amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined
  const stablecoin = amountOut?.currency
  const [routerPreference] = useAtom(routerPreferenceAtom)
  const trade = useRouterTrade(TradeType.EXACT_OUTPUT, amountOut, currency, stablecoin, {
    type: QuoteType.PRICE,
    preference: routerPreference,
  })

  const price = useMemo(() => {
    if (!currency || !stablecoin) {
      return undefined
    }

    // handle usdc
    if (currency?.wrapped.equals(stablecoin)) {
      return new Price(stablecoin, stablecoin, '1', '1')
    }

    if (trade?.trade) {
      const { numerator, denominator } = trade.trade.routes[0].midPrice
      return new Price(currency, stablecoin, denominator, numerator)
    }
    return undefined
  }, [currency, stablecoin, trade.trade])

  const lastPrice = useRef(price)
  if (!price || !lastPrice.current || !price.equalTo(lastPrice.current)) {
    lastPrice.current = price
  }
  return lastPrice.current
}

export function useUSDCValue(
  currencyAmount: CurrencyAmount<Currency> | undefined | null
): CurrencyAmount<Token> | undefined {
  const price = useUSDCPrice(currencyAmount?.currency)

  return useMemo(() => {
    if (!price || !currencyAmount) return
    try {
      return price.quote(currencyAmount)
    } catch (error) {
      return
    }
  }, [currencyAmount, price])
}
