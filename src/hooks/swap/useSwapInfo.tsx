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

/** Returns the best computed trade. */
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

  const { account } = useWeb3React()
  const [inputBalance, outputBalance] = useCurrencyBalances(
    account,
    useMemo(() => [inputCurrency, outputCurrency], [inputCurrency, outputCurrency])
  )
  const slippage = useSlippage(trade)
  const inputUSDCValue = useUSDCValue(trade.trade?.inputAmount)
  const outputUSDCValue = useUSDCValue(trade.trade?.outputAmount)
  const impact = usePriceImpact(trade.trade, { inputUSDCValue, outputUSDCValue })

  // Use the parsed amount for the exact amount for an immediately responsive UI.
  const inputAmountResponsive = useMemo(
    () => (isExactInput(type) ? parsedAmount : trade.trade?.inputAmount),
    [parsedAmount, trade.trade?.inputAmount, type]
  )
  const outputAmountResponsive = useMemo(
    () => (!isExactInput(type) ? parsedAmount : trade.trade?.outputAmount),
    [parsedAmount, trade.trade?.outputAmount, type]
  )
  const inputUSDCValueResponsive = useUSDCValue(inputAmountResponsive)
  const outputUSDCValueResponsive = useUSDCValue(outputAmountResponsive)

  return useMemo(
    () => ({
      [Field.INPUT]: {
        currency: inputCurrency,
        amount: inputAmountResponsive,
        balance: inputBalance,
        usdc: inputUSDCValueResponsive,
      },
      [Field.OUTPUT]: {
        currency: outputCurrency,
        amount: outputAmountResponsive,
        balance: outputBalance,
        usdc: outputUSDCValueResponsive,
      },
      trade,
      slippage,
      impact,
    }),
    [
      impact,
      inputAmountResponsive,
      inputBalance,
      inputCurrency,
      inputUSDCValueResponsive,
      outputAmountResponsive,
      outputBalance,
      outputCurrency,
      outputUSDCValueResponsive,
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
