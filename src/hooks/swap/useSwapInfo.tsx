import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { INVALID_TRADE, useRouterTrade } from 'hooks/routing/useRouterTrade'
import { useCurrencyBalances } from 'hooks/useCurrencyBalance'
import { PriceImpact, usePriceImpact } from 'hooks/usePriceImpact'
import useSlippage, { DEFAULT_SLIPPAGE, Slippage } from 'hooks/useSlippage'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { useAtomValue } from 'jotai/utils'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { Field, swapAtom } from 'state/swap'
import { isExactInput } from 'utils/tradeType'
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
  const { type, amount, [Field.INPUT]: currencyIn, [Field.OUTPUT]: currencyOut } = useAtomValue(swapAtom)

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(amount, (isExactInput(type) ? currencyIn : currencyOut) ?? undefined),
    [amount, type, currencyIn, currencyOut]
  )
  const hasAmounts = currencyIn && currencyOut && parsedAmount && !isWrap
  const trade = useRouterTrade(
    type,
    routerUrl,
    hasAmounts ? parsedAmount : undefined,
    hasAmounts ? (isExactInput(type) ? currencyOut : currencyIn) : undefined
  )

  const amountIn = useMemo(
    () => (isWrap || isExactInput(type) ? parsedAmount : trade.trade?.inputAmount),
    [isWrap, parsedAmount, trade.trade?.inputAmount, type]
  )
  const amountOut = useMemo(
    () => (isWrap || !isExactInput(type) ? parsedAmount : trade.trade?.outputAmount),
    [isWrap, parsedAmount, trade.trade?.outputAmount, type]
  )

  const { account } = useWeb3React()
  const [balanceIn, balanceOut] = useCurrencyBalances(
    account,
    useMemo(() => [currencyIn, currencyOut], [currencyIn, currencyOut])
  )

  // Compute slippage and impact off of the trade so that it refreshes with the trade.
  // (Using amountIn/amountOut would show (incorrect) intermediate values.)
  const slippage = useSlippage(trade.trade)
  const inputUSDCValue = useUSDCValue(trade.trade?.inputAmount)
  const outputUSDCValue = useUSDCValue(trade.trade?.outputAmount)

  const impact = usePriceImpact(trade.trade, { inputUSDCValue, outputUSDCValue })

  return useMemo(
    () => ({
      [Field.INPUT]: {
        currency: currencyIn,
        amount: amountIn,
        balance: balanceIn,
        usdc: inputUSDCValue,
      },
      [Field.OUTPUT]: {
        currency: currencyOut,
        amount: amountOut,
        balance: balanceOut,
        usdc: outputUSDCValue,
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
      inputUSDCValue,
      outputUSDCValue,
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
