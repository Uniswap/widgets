import { JsonRpcProvider } from '@ethersproject/providers'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useRouterArguments } from 'hooks/routing/useRouterArguments'
import useIsValidBlock from 'hooks/useIsValidBlock'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useStablecoinAmountFromFiatValue } from 'hooks/useStablecoinAmountFromFiatValue'
import ms from 'ms.macro'
import { useEffect, useMemo } from 'react'
import { useLazyGetQuoteQuery } from 'state/routing/slice'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { computeRoutes, transformRoutesToTrade } from 'state/routing/utils'
import { isExactInput } from 'utils/tradeType'

export enum RouterPreference {
  PRICE,
  TRADE,
}

const INVALID_TRADE = { state: TradeState.INVALID, trade: undefined }

/**
 * Returns the best trade by invoking the routing api or the smart order router on the client
 * @param tradeType whether the swap is an exact in/out
 * @param routerUrl the base URL of the integrator's auto router API
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useRouterTrade<TTradeType extends TradeType>(
  tradeType: TTradeType,
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

  const [trigger, { isError, data, currentData }] = useLazyGetQuoteQuery({
    // Price-fetching is informational and costly, so it's done less frequently.
    pollingInterval: routerPreference === RouterPreference.PRICE ? ms`2m` : ms`15s`,
  })
  const isValidBlock = useIsValidBlock(Number(data?.blockNumber))
  const isSyncing = currentData !== data || !isValidBlock

  const isWindowVisible = useIsWindowVisible()
  useEffect(() => {
    if (!isWindowVisible) return
    if (!queryArgs) return
    const preferCacheValue = !(routerPreference === RouterPreference.TRADE && !isValidBlock)
    const { abort } = trigger(queryArgs, preferCacheValue)
    return abort
  }, [isValidBlock, isWindowVisible, queryArgs, routerPreference, trigger])

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

  // get USD gas cost of trade in active chains stablecoin amount
  const gasUseEstimateUSD = useStablecoinAmountFromFiatValue(data?.gasUseEstimateUSD)

  return useMemo(() => {
    if (!currencyIn || !currencyOut) return INVALID_TRADE

    if (!trade && !isError) {
      return { state: TradeState.LOADING, trade: undefined }
    }

    const otherAmount = data
      ? CurrencyAmount.fromRawAmount(isExactInput(tradeType) ? currencyOut : currencyIn, data.quote)
      : undefined
    if (!trade || !otherAmount || isError) {
      return {
        state: TradeState.NO_ROUTE_FOUND,
        trade: undefined,
      }
    }

    return { state: isSyncing ? TradeState.SYNCING : TradeState.VALID, trade, gasUseEstimateUSD }
  }, [currencyIn, currencyOut, trade, isError, data, tradeType, isSyncing, gasUseEstimateUSD])
}
