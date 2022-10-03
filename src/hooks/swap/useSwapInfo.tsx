import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { ALL_SUPPORTED_CHAIN_IDS } from 'constants/chains'
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

/** Any state preventing a Swap is considered an error (including wallet states, LOADING, &c). */
export enum SwapError {
  WALLET_DISCONNECTED,
  WALLET_CONNECTING,
  UNSUPPORTED_CHAIN,
  MISSING_INPUTS,
  INSUFFICIENT_BALANCE,
  INSUFFICIENT_LIQUIDITY,
  LOADING,
  UNKNOWN,
}

interface SwapInfo {
  [Field.INPUT]: SwapField
  [Field.OUTPUT]: SwapField
  error?: SwapError
  trade?: {
    state: TradeState
    trade?: InterfaceTrade
    gasUseEstimateUSD?: CurrencyAmount<Token>
    slippage: Slippage
    impact?: PriceImpact
  }
}

/** Returns the best computed trade. */
function useComputeSwapInfo(routerUrl?: string): SwapInfo {
  const {
    type: tradeType,
    amount,
    [Field.INPUT]: inputCurrency,
    [Field.OUTPUT]: outputCurrency,
  } = useAtomValue(swapAtom)
  const isWrap = useIsWrap()

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(amount, (isExactInput(tradeType) ? inputCurrency : outputCurrency) ?? undefined),
    [amount, inputCurrency, outputCurrency, tradeType]
  )
  const trade = useRouterTrade(
    tradeType,
    parsedAmount,
    isExactInput(tradeType) ? outputCurrency : inputCurrency,
    isWrap ? RouterPreference.SKIP : RouterPreference.TRADE,
    routerUrl
  )

  // Use the parsed amount for the exact amount for an immediately responsive UI.
  const [inputAmountResponsive, outputAmountResponsive] = useMemo(() => {
    if (isWrap) {
      return isExactInput(tradeType)
        ? [parsedAmount, tryParseCurrencyAmount(amount, outputCurrency)]
        : [tryParseCurrencyAmount(amount, inputCurrency), parsedAmount]
    }
    return isExactInput(tradeType)
      ? [parsedAmount, trade.trade?.outputAmount]
      : [trade.trade?.inputAmount, parsedAmount]
  }, [
    amount,
    inputCurrency,
    isWrap,
    outputCurrency,
    parsedAmount,
    trade.trade?.inputAmount,
    trade.trade?.outputAmount,
    tradeType,
  ])
  const inputUSDCValueResponsive = useUSDCValue(inputAmountResponsive)
  const outputUSDCValueResponsive = useUSDCValue(outputAmountResponsive)

  const { account, chainId, isActivating } = useWeb3React()
  const [inputBalance, outputBalance] = useCurrencyBalances(
    account,
    useMemo(() => [inputCurrency, outputCurrency], [inputCurrency, outputCurrency])
  )
  const slippage = useSlippage(trade)
  const inputUSDCValue = useUSDCValue(trade.trade?.inputAmount)
  const outputUSDCValue = useUSDCValue(trade.trade?.outputAmount)
  const impact = usePriceImpact(trade.trade, { inputUSDCValue, outputUSDCValue })

  const error = useMemo(() => {
    if (trade.state === TradeState.LOADING) return SwapError.LOADING
    if (!account || !chainId) return isActivating ? SwapError.WALLET_CONNECTING : SwapError.WALLET_DISCONNECTED
    if (!ALL_SUPPORTED_CHAIN_IDS.includes(chainId)) return SwapError.UNSUPPORTED_CHAIN
    if (!(inputCurrency && outputCurrency && parsedAmount?.greaterThan(0))) return SwapError.MISSING_INPUTS
    if (inputBalance && inputAmountResponsive?.greaterThan(inputBalance)) return SwapError.INSUFFICIENT_BALANCE
    if (isWrap) return undefined
    if (trade.state === TradeState.NO_ROUTE_FOUND) return SwapError.INSUFFICIENT_LIQUIDITY
    if (trade.state === TradeState.INVALID) return SwapError.UNKNOWN
    return
  }, [
    account,
    chainId,
    inputAmountResponsive,
    inputBalance,
    inputCurrency,
    isActivating,
    isWrap,
    outputCurrency,
    parsedAmount,
    trade.state,
  ])

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
      error,
      trade: isWrap ? undefined : { ...trade, slippage, impact },
    }),
    [
      error,
      impact,
      inputAmountResponsive,
      inputBalance,
      inputCurrency,
      inputUSDCValueResponsive,
      isWrap,
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
  error: SwapError.LOADING,
  trade: { state: TradeState.INVALID, trade: undefined, slippage: DEFAULT_SLIPPAGE },
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
