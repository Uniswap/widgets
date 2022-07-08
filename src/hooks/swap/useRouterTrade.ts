import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import useAutoRouterSupported from 'hooks/routing/useAutoRouterSupported'
import { useRoutingAPITrade } from 'hooks/routing/useRoutingAPITrade'
import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
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
  routerApiBaseUrl?: string,
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

  return useRoutingAPITrade(
    tradeType,
    routerApiBaseUrl,
    autoRouterSupported && isWindowVisible ? debouncedAmount : undefined,
    debouncedOtherCurrency
  )
}
