import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { RouterPreference, useRouterTrade } from 'hooks/routing/useRouterTrade'
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

import { useIsWrap } from './useWrap'

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
    state: TradeState
    trade?: InterfaceTrade
    gasUseEstimateUSD?: CurrencyAmount<Token>
  }
  slippage: Slippage
  impact?: PriceImpact
}

// from the current swap inputs, compute the best trade and return it.
function useComputeSwapInfo(routerUrl?: string): SwapInfo {
  const { type, amount, [Field.INPUT]: inputCurrency, [Field.OUTPUT]: outputCurrency } = useAtomValue(swapAtom)

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(amount, (isExactInput(type) ? inputCurrency : outputCurrency) ?? undefined),
    [amount, inputCurrency, outputCurrency, type]
  )
  const trade = useRouterTrade(
    type,
    parsedAmount,
    isExactInput(type) ? outputCurrency : inputCurrency,
    useIsWrap() ? RouterPreference.SKIP : RouterPreference.TRADE,
    routerUrl
  )

  const inputAmount = useMemo(
    () => (isExactInput(type) ? parsedAmount : trade.trade?.inputAmount),
    [parsedAmount, trade.trade?.inputAmount, type]
  )
  const outputAmount = useMemo(
    () => (!isExactInput(type) ? parsedAmount : trade.trade?.outputAmount),
    [parsedAmount, trade.trade?.outputAmount, type]
  )

  const { account } = useWeb3React()
  const [inputBalance, outputBalance] = useCurrencyBalances(
    account,
    useMemo(() => [inputCurrency, outputCurrency], [inputCurrency, outputCurrency])
  )

  // Compute slippage and impact off of the trade so that it refreshes with the trade.
  // (Using inputAmount/outputAmount would show (incorrect) intermediate values.)
  const slippage = useSlippage(trade)
  const inputUSDCValue = useUSDCValue(trade.trade?.inputAmount)
  const outputUSDCValue = useUSDCValue(trade.trade?.outputAmount)

  const impact = usePriceImpact(trade.trade, { inputUSDCValue, outputUSDCValue })

  return useMemo(
    () => ({
      [Field.INPUT]: {
        currency: inputCurrency,
        amount: inputAmount,
        balance: inputBalance,
        usdc: inputUSDCValue,
      },
      [Field.OUTPUT]: {
        currency: outputCurrency,
        amount: outputAmount,
        balance: outputBalance,
        usdc: outputUSDCValue,
      },
      trade,
      slippage,
      impact,
    }),
    [
      impact,
      inputAmount,
      inputBalance,
      inputCurrency,
      inputUSDCValue,
      outputAmount,
      outputBalance,
      outputCurrency,
      outputUSDCValue,
      slippage,
      trade,
    ]
  )
}

const DEFAULT_SWAP_INFO: SwapInfo = {
  [Field.INPUT]: {},
  [Field.OUTPUT]: {},
  trade: { state: TradeState.INVALID, trade: undefined },
  slippage: DEFAULT_SLIPPAGE,
}

const SwapInfoContext = createContext(DEFAULT_SWAP_INFO)

export function SwapInfoProvider({ children, routerUrl }: PropsWithChildren<{ routerUrl?: string }>) {
  const swapInfo = useComputeSwapInfo(routerUrl)
  return <SwapInfoContext.Provider value={swapInfo}>{children}</SwapInfoContext.Provider>
}

/** Requires that SwapInfoUpdater be installed in the DOM tree. **/
export default function useSwapInfo(): SwapInfo {
  return useContext(SwapInfoContext)
}
