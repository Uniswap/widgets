import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import useAutoRouterSupported from 'hooks/routing/useAutoRouterSupported'
import { useRoutingAPITrade } from 'hooks/routing/useRoutingAPITrade'
import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import useLast from 'hooks/useLast'
import { useMemo } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'

export const INVALID_TRADE = { state: TradeState.INVALID, trade: undefined }

/**
 * Returns the best trade by invoking the routing api or the smart order router on the client
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useRouterTrade(
  tradeType: TradeType,
  routerApiBaseUrl?: URL,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
} {
  const autoRouterSupported = useAutoRouterSupported()
  const isWindowVisible = useIsWindowVisible()

  const [debouncedAmount, debouncedOtherCurrency] = useDebounce(
    useMemo(() => [amountSpecified, otherCurrency], [amountSpecified, otherCurrency]),
    200
  )

  const tradeObject = useRoutingAPITrade(
    tradeType,
    routerApiBaseUrl,
    autoRouterSupported && isWindowVisible ? debouncedAmount : undefined,
    debouncedOtherCurrency
  )

  const lastTrade = useLast(tradeObject.trade, Boolean) ?? undefined

  // Return the last trade while syncing/loading to avoid jank from clearing the last trade while loading.
  // If the trade is unsettled and not stale, return the last trade as a placeholder during settling.
  return useMemo(() => {
    const { state, trade } = tradeObject
    // If the trade is in a settled state, return it.
    if (state === TradeState.INVALID) return INVALID_TRADE
    if ((state !== TradeState.LOADING && state !== TradeState.SYNCING) || trade) return tradeObject

    const [currencyIn, currencyOut] =
      tradeType === TradeType.EXACT_INPUT
        ? [amountSpecified?.currency, otherCurrency]
        : [otherCurrency, amountSpecified?.currency]

    // If the trade currencies have switched, consider it stale - do not return the last trade.
    const isStale =
      (currencyIn && !lastTrade?.inputAmount?.currency.equals(currencyIn)) ||
      (currencyOut && !lastTrade?.outputAmount?.currency.equals(currencyOut))
    if (isStale) return tradeObject

    return { state, trade: lastTrade }
  }, [amountSpecified?.currency, lastTrade, otherCurrency, tradeObject, tradeType])
}
