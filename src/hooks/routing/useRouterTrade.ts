import { BigNumber } from '@ethersproject/bignumber'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Currency, CurrencyAmount, Price, Token, TradeType } from '@uniswap/sdk-core'
import {
  calcStablecoinAmountFromFiatValue,
  useStablecoinAmountFromFiatValue,
} from 'hooks/useStablecoinAmountFromFiatValue'
import useTimeout from 'hooks/useTimeout'
import { useCallback, useMemo } from 'react'
import { useGetQuoteArgs } from 'state/routing/args'
import { useGetQuoteQueryState, useLazyGetQuoteQuery } from 'state/routing/slice'
import { NO_ROUTE, TradeState, WidoTrade } from 'state/routing/types'
import { QuoteResult } from 'wido'

import { RouterPreference } from './types'

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
  routerPreference: RouterPreference,
  account?: string
): {
  state: TradeState
  trade?: WidoTrade
  error?: string
  gasUseEstimateUSD?: CurrencyAmount<Token>
} {
  const queryArgs = useGetQuoteArgs(
    { tradeType, amountSpecified, currencyIn, currencyOut, routerPreference, account },
    /*skip=*/ routerPreference === RouterPreference.SKIP
  )

  const pollingInterval = useMemo(() => {
    if (!amountSpecified) return Infinity
    switch (routerPreference) {
      // PRICE fetching is informational and costly, so it is done less frequently.
      case RouterPreference.PRICE:
        // return ms`2m` // TODO(daniel)
        return Infinity
      case RouterPreference.API:
        // return ms`15s` // TODO(daniel)
        return Infinity
      case RouterPreference.SKIP:
        return Infinity
    }
  }, [amountSpecified, routerPreference])

  // Get the cached state *immediately* to update the UI without sending a request - using useGetQuoteQueryState -
  // but debounce the actual request - using useLazyGetQuoteQuery - to avoid flooding the router / JSON-RPC endpoints.
  const { isError, data, currentData, fulfilledTimeStamp, error } = useGetQuoteQueryState(queryArgs)
  let errorMessage = (error as any)?.error
  if (typeof errorMessage == 'string') {
    errorMessage = errorMessage.replace('SERVER_ERR: ', '')
  }

  // An already-fetched value should be refetched if it is older than the pollingInterval.
  // Without explicit refetch, it would not be refetched until another pollingInterval has elapsed.
  const [trigger] = useLazyGetQuoteQuery({ pollingInterval })
  const request = useCallback(() => {
    const { refetch } = trigger(queryArgs, /*preferCacheValue=*/ true)
    if (fulfilledTimeStamp && Date.now() - fulfilledTimeStamp > pollingInterval) {
      refetch()
    }
  }, [fulfilledTimeStamp, pollingInterval, queryArgs, trigger])
  useTimeout(request, 200)

  const quote = typeof data === 'object' ? (data as Required<QuoteResult>) : undefined

  const isValid = currentData === data

  const trade = useMemo(() => {
    if (!quote) return
    if (!currencyIn) return
    if (!currencyOut) return

    const trade: WidoTrade = {
      inputAmount: CurrencyAmount.fromRawAmount(currencyIn, quote.fromTokenAmount),
      outputAmount: CurrencyAmount.fromRawAmount(currencyOut, quote.toTokenAmount),
      inputAmountUsdValue: calcStablecoinAmountFromFiatValue(quote.fromTokenAmountUsdValue, currencyIn.chainId),
      outputAmountUsdValue: calcStablecoinAmountFromFiatValue(quote.toTokenAmountUsdValue, currencyOut.chainId),
      executionPrice: new Price(currencyIn, currencyOut, quote.fromTokenAmount, quote.toTokenAmount),
      fromToken: currencyIn,
      toToken: currencyOut,
      tx: quote.data
        ? {
            from: quote.from,
            to: quote.to,
            data: quote.data,
            value: quote.value ? BigNumber.from(quote.value) : BigNumber.from(0),
          }
        : undefined,
      tradeType: TradeType.EXACT_INPUT,
      steps: quote.steps,
      messages: quote.messages,
      gasFee: quote.gasFee,
      gasFeeUsdValue: quote.gasFeeUsdValue,
    }
    return trade
  }, [quote, currencyIn, currencyOut])

  const gasUseEstimateUSD = useStablecoinAmountFromFiatValue(trade?.gasFeeUsdValue)

  return useMemo(() => {
    if (!amountSpecified || isError || queryArgs === skipToken) {
      return { ...TRADE_INVALID, error: errorMessage }
    } else if (data === NO_ROUTE) {
      return TRADE_NOT_FOUND
    } else if (!trade) {
      return TRADE_LOADING
    } else {
      const state = isValid ? TradeState.VALID : TradeState.LOADING
      return { state, trade, gasUseEstimateUSD }
    }
  }, [isError, amountSpecified, queryArgs, data, trade, isValid, gasUseEstimateUSD, errorMessage])
}
