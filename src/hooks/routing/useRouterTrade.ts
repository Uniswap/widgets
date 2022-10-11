import { skipToken } from '@reduxjs/toolkit/query/react'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import useIsValidBlock from 'hooks/useIsValidBlock'
import { useStablecoinAmountFromFiatValue } from 'hooks/useStablecoinAmountFromFiatValue'
import useTimeout from 'hooks/useTimeout'
import ms from 'ms.macro'
import { useCallback, useMemo } from 'react'
import { useGetQuoteArgs } from 'state/routing/args'
import { useGetQuoteQueryState, useLazyGetQuoteQuery } from 'state/routing/slice'
import { InterfaceTrade, NO_ROUTE, TradeState } from 'state/routing/types'
import { computeRoutes, transformRoutesToTrade } from 'state/routing/utils'
import { isExactInput } from 'utils/tradeType'

export enum RouterPreference {
  PRICE,
  TRADE,
}

const TRADE_INVALID = { state: TradeState.INVALID, trade: undefined }
const TRADE_NOT_FOUND = { state: TradeState.NO_ROUTE_FOUND, trade: undefined }
const TRADE_LOADING = { state: TradeState.LOADING, trade: undefined }

/**
 * Returns the best trade by invoking the routing api or the smart order router on the client
 * @param tradeType whether the swap is an exact in/out
 * @param routerUrl the base URL of the integrator's auto router API
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useRouterTrade(
  tradeType: TradeType,
  amountSpecified: CurrencyAmount<Currency> | undefined,
  otherCurrency: Currency | undefined,
  routerPreference: RouterPreference,
  routerUrl?: string
): {
  state: TradeState
  trade?: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token>
} {
  const { provider } = useWeb3React()
  const queryArgs = useGetQuoteArgs({ provider, tradeType, amountSpecified, otherCurrency, routerUrl })

  // PRICE fetching is informational and costly, so it is done less frequently.
  const pollingInterval = routerPreference === RouterPreference.PRICE ? ms`2m` : ms`15s`

  // Get the cached state *immediately* to update the UI without sending a request - using useGetQuoteQueryState -
  // but debounce the actual request - using useLazyGetQuoteQuery - to avoid flooding the router / JSON-RPC endpoints.
  const { isError, isFetching, data, currentData, fulfilledTimeStamp } = useGetQuoteQueryState(queryArgs)

  // An already-fetched value should be refetched if it is older than the pollingInterval.
  // Without explicit refetch, it would not be refetched until another pollingInterval has elapsed.
  const [trigger] = useLazyGetQuoteQuery({ pollingInterval })
  const request = useCallback(() => {
    const { refetch } = trigger(queryArgs, /*preferCacheValue=*/ true)
    if (!isFetching && fulfilledTimeStamp && Date.now() - fulfilledTimeStamp > pollingInterval) {
      refetch()
    }
  }, [fulfilledTimeStamp, isFetching, pollingInterval, queryArgs, trigger])
  useTimeout(request, 200)

  const result = typeof data === 'object' ? data : undefined
  const trade = useMemo(() => {
    const [currencyIn, currencyOut] = isExactInput(tradeType)
      ? [amountSpecified?.currency, otherCurrency]
      : [otherCurrency, amountSpecified?.currency]
    const routes = computeRoutes(currencyIn, currencyOut, tradeType, result)
    if (!routes || routes.length === 0) return
    try {
      return transformRoutesToTrade(routes, tradeType)
    } catch (e: unknown) {
      console.debug('transformRoutesToTrade failed: ', e)
      return
    }
  }, [amountSpecified?.currency, otherCurrency, result, tradeType])
  const isValidBlock = useIsValidBlock(Number(result?.blockNumber))
  const isLoading = currentData !== data || !isValidBlock
  const gasUseEstimateUSD = useStablecoinAmountFromFiatValue(result?.gasUseEstimateUSD)

  return useMemo(() => {
    if (queryArgs === skipToken) return TRADE_INVALID
    if (data === NO_ROUTE) return TRADE_NOT_FOUND

    if (!trade) return isError ? TRADE_NOT_FOUND : TRADE_LOADING

    const state = isLoading ? TradeState.LOADING : TradeState.VALID
    return { state, trade, gasUseEstimateUSD }
  }, [queryArgs, data, trade, isError, isLoading, gasUseEstimateUSD])
}
