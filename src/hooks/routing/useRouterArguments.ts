import { JsonRpcProvider } from '@ethersproject/providers'
import { SkipToken, skipToken } from '@reduxjs/toolkit/query'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useMemo } from 'react'
import { GetQuoteArgs } from 'state/routing/slice'

/**
 * Returns GetQuoteArgs for the Routing API query or SkipToken if the query should be skipped
 * (this includes if the window is not visible).
 * NB: Input arguments do not need to be memoized, as they will be destructured.
 */
export function useRouterArguments({
  tokenIn,
  tokenOut,
  amount,
  tradeType,
  routerUrl,
  provider,
}: {
  tokenIn: Currency | undefined
  tokenOut: Currency | undefined
  amount: CurrencyAmount<Currency> | undefined
  tradeType: TradeType
  routerUrl: string | undefined
  provider: JsonRpcProvider
}): GetQuoteArgs | SkipToken {
  const args = useMemo(() => {
    if (!tokenIn || !tokenOut || !amount || tokenIn.equals(tokenOut)) return null
    return {
      amount: amount.quotient.toString(),
      tokenInAddress: tokenIn.wrapped.address,
      tokenInChainId: tokenIn.wrapped.chainId,
      tokenInDecimals: tokenIn.wrapped.decimals,
      tokenInSymbol: tokenIn.wrapped.symbol,
      tokenOutAddress: tokenOut.wrapped.address,
      tokenOutChainId: tokenOut.wrapped.chainId,
      tokenOutDecimals: tokenOut.wrapped.decimals,
      tokenOutSymbol: tokenOut.wrapped.symbol,
      routerUrl,
      tradeType,
      provider,
    }
  }, [tokenIn, tokenOut, amount, routerUrl, tradeType, provider])

  const isWindowVisible = useIsWindowVisible()
  return (isWindowVisible ? args : null) ?? skipToken
}
