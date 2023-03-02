import { skipToken } from '@reduxjs/toolkit/query/react'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import useIsValidBlock from 'hooks/useIsValidBlock'
import { useStablecoinAmountFromFiatValue } from 'hooks/useStablecoinAmountFromFiatValue'
import useTimeout from 'hooks/useTimeout'
import ms from 'ms.macro'
import { useCallback, useMemo } from 'react'
import { useGetQuoteArgs } from 'state/routing/args'
import { useGetTradeQuoteQueryState, useLazyGetTradeQuoteQuery } from 'state/routing/slice'
import { InterfaceTrade, NO_ROUTE, TradeResult, TradeState } from 'state/routing/types'

import { QuoteConfig, QuoteType } from './types'

const TRADE_INVALID = { state: TradeState.INVALID, trade: undefined }
const TRADE_NOT_FOUND = { state: TradeState.NO_ROUTE_FOUND, trade: undefined }
const TRADE_LOADING = { state: TradeState.LOADING, trade: undefined }

/**
 * Returns the best trade by invoking the routing api or the smart order router on the client
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useRouterTrade(
  tradeType: TradeType,
  amountSpecified: CurrencyAmount<Currency> | undefined,
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
  quoteConfig: QuoteConfig
): {
  state: TradeState
  trade?: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token>
} {
  const { provider } = useWeb3React()
  const queryArgs = useGetQuoteArgs(
    {
      provider,
      tradeType,
      amountSpecified,
      currencyIn,
      currencyOut,
    },
    quoteConfig
  )

  const pollingInterval = useMemo(() => {
    if (!amountSpecified) return Infinity
    switch (quoteConfig.type) {
      // PRICE fetching is informational and costly, so it is done less frequently.
      case QuoteType.PRICE:
        return ms`2m`
      case QuoteType.TRADE:
        return ms`15s`
      case QuoteType.SKIP:
        return Infinity
    }
  }, [amountSpecified, quoteConfig])

  // Get the cached state *immediately* to update the UI without sending a request - using useGetTradeQuoteQueryState -
  // but debounce the actual request - using useLazyGetTradeQuoteQuery - to avoid flooding the router / JSON-RPC endpoints.
  const { isError, data, currentData, fulfilledTimeStamp } = useGetTradeQuoteQueryState(queryArgs)

  // An already-fetched value should be refetched if it is older than the pollingInterval.
  // Without explicit refetch, it would not be refetched until another pollingInterval has elapsed.
  const [trigger] = useLazyGetTradeQuoteQuery({ pollingInterval })
  const request = useCallback(() => {
    const { refetch } = trigger(queryArgs, /*preferCacheValue=*/ true)
    if (fulfilledTimeStamp && Date.now() - fulfilledTimeStamp > pollingInterval) {
      refetch()
    }
  }, [fulfilledTimeStamp, pollingInterval, queryArgs, trigger])
  useTimeout(request, 200)

  const tradeResult: TradeResult | undefined = typeof data === 'object' ? data : undefined
  const isValidBlock = useIsValidBlock(Number(tradeResult?.blockNumber))
  const isValid = currentData === data && isValidBlock
  const gasUseEstimateUSD = useStablecoinAmountFromFiatValue(tradeResult?.gasUseEstimateUSD)

  return useMemo(() => {
    if (!amountSpecified || isError || queryArgs === skipToken) {
      return TRADE_INVALID
    } else if (data === NO_ROUTE && isValid) {
      return TRADE_NOT_FOUND
    } else if (!tradeResult?.trade) {
      return TRADE_LOADING
    } else {
      const state = isValid ? TradeState.VALID : TradeState.LOADING
      return { state, trade: tradeResult?.trade, gasUseEstimateUSD }
    }
  }, [amountSpecified, isError, queryArgs, data, tradeResult?.trade, isValid, gasUseEstimateUSD])
}
