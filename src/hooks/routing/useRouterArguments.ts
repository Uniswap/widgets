import { JsonRpcProvider } from '@ethersproject/providers'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { useMemo } from 'react'

/**
 * Returns query arguments for the Routing API query or undefined if the
 * query should be skipped. Input arguments do not need to be memoized, as they will
 * be destructured.
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
}) {
  return useMemo(
    () =>
      !tokenIn || !tokenOut || !amount || tokenIn.equals(tokenOut)
        ? undefined
        : {
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
            provider,
            tradeType,
          },
    [amount, tokenIn, tokenOut, tradeType, routerUrl, provider]
  )
}
