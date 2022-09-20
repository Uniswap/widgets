import { JsonRpcProvider } from '@ethersproject/providers'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useRouterArguments } from 'hooks/routing/useRouterArguments'
import useIsValidBlock from 'hooks/useIsValidBlock'
import { useStablecoinAmountFromFiatValue } from 'hooks/useStablecoinAmountFromFiatValue'
import useTimeout from 'hooks/useTimeout'
import ms from 'ms.macro'
import { useCallback, useMemo } from 'react'
import { useGetQuoteQueryState, useLazyGetQuoteQuery } from 'state/routing/slice'
import { InterfaceTrade, TradeState } from 'state/routing/types'
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
  const [currencyIn, currencyOut] = isExactInput(tradeType)
    ? [amountSpecified?.currency, otherCurrency]
    : [otherCurrency, amountSpecified?.currency]
  const queryArgs = useRouterArguments({
    tokenIn: currencyIn,
    tokenOut: currencyOut,
    amount: amountSpecified,
    tradeType,
    routerUrl,
    provider: provider as JsonRpcProvider,
  })

  // Get the cached state *immediately* to update the UI without sending a request - using useGetQuoteQueryState -
  // but debounce the actual request - using useLazyGetQuoteQuery - to avoid flooding the router / JSON-RPC endpoints.
  const { isError, data, currentData } = useGetQuoteQueryState(queryArgs)
  const isValidBlock = useIsValidBlock(Number(data?.blockNumber))
  const isSyncing = currentData !== data || !isValidBlock

  const [trigger] = useLazyGetQuoteQuery({
    // PRICE fetching is informational and costly, so it's done less frequently.
    pollingInterval: routerPreference === RouterPreference.PRICE ? ms`2m` : ms`15s`,
  })
  const request = useCallback(() => {
    // TRADE fetching should be up-to-date, so an already-fetched value should be updated if re-queried.
    const eagerlyFetchValue = routerPreference === RouterPreference.TRADE
    trigger(queryArgs, /*preferCacheValue=*/ !eagerlyFetchValue)
  }, [queryArgs, routerPreference, trigger])
  useTimeout(request, 200)

  const route = useMemo(
    () => computeRoutes(currencyIn, currencyOut, tradeType, data),
    [currencyIn, currencyOut, data, tradeType]
  )
  const trade = useMemo(() => {
    if (!route || route.length === 0) return
    try {
      return transformRoutesToTrade(route, tradeType)
    } catch (e: unknown) {
      console.debug('transformRoutesToTrade failed: ', e)
      return
    }
  }, [route, tradeType])
  const gasUseEstimateUSD = useStablecoinAmountFromFiatValue(data?.gasUseEstimateUSD)

  return useMemo(() => {
    if (!currencyIn || !currencyOut) return TRADE_INVALID
    if (!trade && !isError) return TRADE_LOADING

    const otherAmount = data
      ? CurrencyAmount.fromRawAmount(isExactInput(tradeType) ? currencyOut : currencyIn, data.quote)
      : undefined
    if (!trade || !otherAmount || isError) return TRADE_NOT_FOUND

    const state = isSyncing ? TradeState.SYNCING : TradeState.VALID
    return { state, trade, gasUseEstimateUSD }
  }, [currencyIn, currencyOut, trade, isError, data, tradeType, isSyncing, gasUseEstimateUSD])
}
