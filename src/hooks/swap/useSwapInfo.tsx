import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { INVALID_TRADE, useRouterTrade } from 'hooks/routing/useRouterTrade'
import { useCurrencyBalances } from 'hooks/useCurrencyBalance'
import useSlippage, { DEFAULT_SLIPPAGE, Slippage } from 'hooks/useSlippage'
import useUSDCPriceImpact, { PriceImpact } from 'hooks/useUSDCPriceImpact'
import { useAtomValue } from 'jotai/utils'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { Field, swapAtom } from 'state/swap'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'

import { useIsWrap } from './useWrapCallback'

interface SwapField {
  currency?: Currency
  amount?: CurrencyAmount<Currency>
  balance?: CurrencyAmount<Currency>
  usdc?: CurrencyAmount<Currency>
}

interface SwapInfo {
  [Field.INPUT]: SwapField
  [Field.OUTPUT]: SwapField
  trade: {
    trade?: InterfaceTrade<Currency, Currency, TradeType>
    state: TradeState
  }
  slippage: Slippage
  impact?: PriceImpact
}

// from the current swap inputs, compute the best trade and return it.
function useComputeSwapInfo(routerUrl?: string): SwapInfo {
  const isWrap = useIsWrap()
  const { independentField, amount, [Field.INPUT]: currencyIn, [Field.OUTPUT]: currencyOut } = useAtomValue(swapAtom)
  const isExactIn = independentField === Field.INPUT

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(amount, (isExactIn ? currencyIn : currencyOut) ?? undefined),
    [amount, isExactIn, currencyIn, currencyOut]
  )
  const hasAmounts = currencyIn && currencyOut && parsedAmount && !isWrap
  const trade = useRouterTrade(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    routerUrl,
    hasAmounts ? parsedAmount : undefined,
    hasAmounts ? (isExactIn ? currencyOut : currencyIn) : undefined
  )

  const amountIn = useMemo(
    () => (isWrap || isExactIn ? parsedAmount : trade.trade?.inputAmount),
    [isExactIn, isWrap, parsedAmount, trade.trade?.inputAmount]
  )
  const amountOut = useMemo(
    () => (isWrap || !isExactIn ? parsedAmount : trade.trade?.outputAmount),
    [isExactIn, isWrap, parsedAmount, trade.trade?.outputAmount]
  )

  const { account } = useWeb3React()
  const [balanceIn, balanceOut] = useCurrencyBalances(
    account,
    useMemo(() => [currencyIn, currencyOut], [currencyIn, currencyOut])
  )

  // Compute slippage and impact off of the trade so that it refreshes with the trade.
  // (Using amountIn/amountOut would show (incorrect) intermediate values.)
  const slippage = useSlippage(trade.trade)
  const { inputUSDC, outputUSDC, impact } = useUSDCPriceImpact(trade.trade?.inputAmount, trade.trade?.outputAmount)

  return useMemo(
    () => ({
      [Field.INPUT]: {
        currency: currencyIn,
        amount: amountIn,
        balance: balanceIn,
        usdc: inputUSDC,
      },
      [Field.OUTPUT]: {
        currency: currencyOut,
        amount: amountOut,
        balance: balanceOut,
        usdc: outputUSDC,
      },
      trade,
      slippage,
      impact,
    }),
    [
      amountIn,
      amountOut,
      balanceIn,
      balanceOut,
      currencyIn,
      currencyOut,
      impact,
      inputUSDC,
      outputUSDC,
      slippage,
      trade,
    ]
  )
}

const DEFAULT_SWAP_INFO: SwapInfo = {
  [Field.INPUT]: {},
  [Field.OUTPUT]: {},
  trade: INVALID_TRADE,
  slippage: DEFAULT_SLIPPAGE,
}

const SwapInfoContext = createContext(DEFAULT_SWAP_INFO)

export function SwapInfoProvider({
  children,
  disabled,
  routerUrl,
}: PropsWithChildren<{ disabled?: boolean; routerUrl?: string }>) {
  const swapInfo = useComputeSwapInfo(routerUrl)
  if (disabled) {
    return <SwapInfoContext.Provider value={DEFAULT_SWAP_INFO}>{children}</SwapInfoContext.Provider>
  }
  return <SwapInfoContext.Provider value={swapInfo}>{children}</SwapInfoContext.Provider>
}

/** Requires that SwapInfoUpdater be installed in the DOM tree. **/
export default function useSwapInfo(): SwapInfo {
  return useContext(SwapInfoContext)
}
