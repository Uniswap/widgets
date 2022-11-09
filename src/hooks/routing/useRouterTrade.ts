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

export enum RouterPreference {
  PRICE,
  TRADE,
  SKIP,
}

const TRADE_INVALID = { state: TradeState.INVALID, trade: undefined }
const TRADE_NOT_FOUND = { state: TradeState.NO_ROUTE_FOUND, trade: undefined }
const TRADE_LOADING = { state: TradeState.LOADING, trade: undefined }

/**
 * Returns the best trade by invoking the routing api or the smart order router on the client
 * @param tradeType whether the swap is an exact in/out
 * @param routerUrl the base URL of the integrator's auto router API
 * @param amountSpecified the exact amount to swap in/out
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useRouterTrade(
  tradeType: TradeType,
  amountSpecified: CurrencyAmount<Currency> | undefined,
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
  routerPreference: RouterPreference,
  routerUrl?: string
): {
  state: TradeState
  trade?: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token>
} {
  const { provider } = useWeb3React()
  const queryArgs = useGetQuoteArgs(
    { provider, tradeType, amountSpecified, currencyIn, currencyOut, routerUrl },
    /*skip=*/ routerPreference === RouterPreference.SKIP
  )

  const pollingInterval = useMemo(() => {
    if (!amountSpecified) return Infinity
    switch (routerPreference) {
      // PRICE fetching is informational and costly, so it is done less frequently.
      case RouterPreference.PRICE:
        return ms`2m`
      case RouterPreference.TRADE:
        return ms`15s`
      case RouterPreference.SKIP:
        return Infinity
    }
  }, [amountSpecified, routerPreference])

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

  const quote = typeof data === 'object' ? data : undefined
  const trade = useMemo(() => {
    const routes = computeRoutes(currencyIn, currencyOut, tradeType, quote)
    if (!routes || routes.length === 0) return
    try {
      return transformRoutesToTrade(routes, tradeType)
    } catch (e: unknown) {
      console.debug('transformRoutesToTrade failed: ', e)
      return
    }
  }, [currencyIn, currencyOut, quote, tradeType])
  const isValidBlock = useIsValidBlock(Number(quote?.blockNumber))
  const isValid = currentData === data && isValidBlock
  const gasUseEstimateUSD = useStablecoinAmountFromFiatValue(quote?.gasUseEstimateUSD)

  return useMemo(() => {
    if (!amountSpecified || isError || queryArgs === skipToken) {
      return TRADE_INVALID
    } else if (data === NO_ROUTE) {
      return TRADE_NOT_FOUND
    } else if (!trade) {
      return TRADE_LOADING
    } else {
      const state = isValid ? TradeState.VALID : TradeState.LOADING
      return { state, trade, gasUseEstimateUSD }
    }
  }, [isError, amountSpecified, queryArgs, data, trade, isValid, gasUseEstimateUSD])
}
