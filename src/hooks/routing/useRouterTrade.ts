import { skipToken } from '@reduxjs/toolkit/query/react'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
// eslint-disable-next-line no-restricted-imports
import { ChainId } from '@uniswap/smart-order-router'
import { useRouterArguments } from 'hooks/routing/useRouterArguments'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useDebounce from 'hooks/useDebounce'
import useIsValidBlock from 'hooks/useIsValidBlock'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
// TODO: double-check that we're removing these analytics/metrics packages from widget?
// import { IMetric, MetricLoggerUnit, setGlobalMetric } from '@uniswap/smart-order-router'
// import { sendTiming } from 'components/analytics'
import { useStablecoinAmountFromFiatValue } from 'hooks/useUSDCPrice'
import ms from 'ms.macro'
import { useMemo } from 'react'
import { useGetQuoteQuery } from 'state/routing/slice'
import { GetQuoteResult, InterfaceTrade, TradeState } from 'state/routing/types'
import { computeRoutes, transformRoutesToTrade } from 'state/routing/utils'

import { AUTO_ROUTER_SUPPORTED_CHAINS } from './clientSideSmartOrderRouter'
import useAutoRouterSupported from './useAutoRouterSupported'

export const INVALID_TRADE = { state: TradeState.INVALID, trade: undefined }

/**
 * Returns the best trade by invoking the routing api or the smart order router on the client
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useRouterTrade<TTradeType extends TradeType>(
  // TODO: is function name confusing? We use both API & SOR in getQuote
  tradeType: TTradeType,
  routerApiBaseUrl?: string,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TTradeType> | undefined
} {
  const autoRouterSupported = useAutoRouterSupported()
  const isWindowVisible = useIsWindowVisible()
  // Debounce is used to prevent excessive requests to SOR, as it is data intensive.
  // Fast user actions (ie updating the input) should be debounced, but currency changes should not.
  const [debouncedAmount, debouncedOtherCurrency] = useDebounce(
    useMemo(() => [amountSpecified, otherCurrency], [amountSpecified, otherCurrency]),
    200
  )
  const debouncedAmountSpecified = autoRouterSupported && isWindowVisible ? debouncedAmount : undefined

  const [currencyIn, currencyOut]: [Currency | undefined, Currency | undefined] = useMemo(
    () =>
      tradeType === TradeType.EXACT_INPUT
        ? [debouncedAmountSpecified?.currency, debouncedOtherCurrency]
        : [debouncedOtherCurrency, debouncedAmountSpecified?.currency],
    [debouncedAmountSpecified, debouncedOtherCurrency, tradeType]
  )

  const chainId = currencyIn?.chainId as ChainId
  if (chainId && !AUTO_ROUTER_SUPPORTED_CHAINS.includes(chainId)) {
    throw new Error(`Router does not support this chain (chainId: ${chainId}).`)
  }

  // TODO(kristiehuang): after merging in fallback jsonRpcEndpoints, cloudflare-eth.com does not support eth_feeHistory, which we need for the router :/
  // is there any downside to just using the (free) flashbots RPC endpoints instead? https://docs.flashbots.net/flashbots-protect/rpc/ratelimiting
  const { library } = useActiveWeb3React()
  const providerUrl = library?.connection.url || `https://rpc.flashbots.net`
  const queryArgs = useRouterArguments({
    tokenIn: currencyIn,
    tokenOut: currencyOut,
    amount: debouncedAmountSpecified,
    tradeType,
    baseUrl: routerApiBaseUrl,
    useClientSideRouter: !Boolean(routerApiBaseUrl), // False if URL is '' or undefined
    providerUrl,
  })

  const { isFetching, isError, data, currentData } = useGetQuoteQuery(queryArgs ?? skipToken, {
    pollingInterval: ms`15s`,
    refetchOnFocus: true,
  })

  const quoteResult: GetQuoteResult | undefined = useIsValidBlock(Number(data?.blockNumber) || 0) ? data : undefined

  const route = useMemo(
    () => computeRoutes(currencyIn, currencyOut, tradeType, quoteResult),
    [currencyIn, currencyOut, quoteResult, tradeType]
  )

  // get USD gas cost of trade in active chains stablecoin amount
  const gasUseEstimateUSD = useStablecoinAmountFromFiatValue(quoteResult?.gasUseEstimateUSD) ?? null

  const isSyncing = currentData !== data

  return useMemo(() => {
    if (!currencyIn || !currencyOut) {
      return {
        state: TradeState.INVALID,
        trade: undefined,
      }
    }

    if (isFetching) {
      return {
        state: TradeState.LOADING,
        trade: undefined,
      }
    }

    let otherAmount = undefined
    if (quoteResult) {
      if (tradeType === TradeType.EXACT_INPUT && currencyOut) {
        otherAmount = CurrencyAmount.fromRawAmount(currencyOut, quoteResult.quote)
      }

      if (tradeType === TradeType.EXACT_OUTPUT && currencyIn) {
        otherAmount = CurrencyAmount.fromRawAmount(currencyIn, quoteResult.quote)
      }
    }

    if (isError || !otherAmount || !route || route.length === 0 || !queryArgs) {
      return {
        state: TradeState.NO_ROUTE_FOUND,
        trade: undefined,
      }
    }

    try {
      const trade = transformRoutesToTrade(route, tradeType, gasUseEstimateUSD)
      return {
        // always return VALID regardless of isFetching status
        state: isSyncing ? TradeState.SYNCING : TradeState.VALID,
        trade,
      }
    } catch (e) {
      return { state: TradeState.INVALID, trade: undefined }
    }
  }, [
    currencyIn,
    currencyOut,
    quoteResult,
    isFetching,
    tradeType,
    isError,
    route,
    queryArgs,
    gasUseEstimateUSD,
    isSyncing,
  ])
}

// We want to remove this from widget right?

// only want to enable this when app hook called
// class GAMetric extends IMetric {
//   putDimensions() {
//     return
//   }

//   putMetric(key: string, value: number, unit?: MetricLoggerUnit) {
//     sendTiming('Routing API', `${key} | ${unit}`, value, 'client')
//   }
// }

// setGlobalMetric(new GAMetric())
