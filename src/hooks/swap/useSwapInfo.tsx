import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { RouterPreference, useRouterTrade } from 'hooks/routing/useRouterTrade'
import { useCurrencyBalances } from 'hooks/useCurrencyBalance'
import useOnSupportedNetwork from 'hooks/useOnSupportedNetwork'
import { PriceImpact, usePriceImpact } from 'hooks/usePriceImpact'
import useSlippage, { DEFAULT_SLIPPAGE, Slippage } from 'hooks/useSlippage'
import useSwitchChain from 'hooks/useSwitchChain'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import useConnectors from 'hooks/web3/useConnectors'
import { useAtomValue } from 'jotai/utils'
import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { Field, swapAtom, swapEventHandlersAtom } from 'state/swap'
import { isExactInput } from 'utils/tradeType'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'

import { useIsWrap } from './useWrapCallback'

export enum ChainError {
  UNCONNECTED_CHAIN,
  ACTIVATING_CHAIN,
  UNSUPPORTED_CHAIN,
  MISMATCHED_TOKEN_CHAINS,
  MISMATCHED_CHAINS,
}

interface SwapField {
  currency?: Currency
  amount?: CurrencyAmount<Currency>
  balance?: CurrencyAmount<Currency>
  usdc?: CurrencyAmount<Currency>
}

interface SwapInfo {
  [Field.INPUT]: SwapField
  [Field.OUTPUT]: SwapField
  error?: ChainError
  trade: {
    state: TradeState
    trade?: InterfaceTrade
    gasUseEstimateUSD?: CurrencyAmount<Token>
  }
  slippage: Slippage
  impact?: PriceImpact
}

/** Returns the best computed swap (trade/wrap). */
function useComputeSwapInfo(routerUrl?: string): SwapInfo {
  const { type, amount, [Field.INPUT]: inputCurrency, [Field.OUTPUT]: outputCurrency } = useAtomValue(swapAtom)
  const { account, chainId, isActivating, isActive } = useWeb3React()
  const isSupported = useOnSupportedNetwork()
  const isWrap = useIsWrap()

  const inputChainId = inputCurrency?.chainId
  const outputChainId = outputCurrency?.chainId
  const tokenChainId = inputChainId || outputChainId
  const error = useMemo(() => {
    if (!isActive) return isActivating ? ChainError.ACTIVATING_CHAIN : ChainError.UNCONNECTED_CHAIN
    if (!isSupported) return ChainError.UNSUPPORTED_CHAIN
    if (inputChainId && outputChainId && inputChainId !== outputChainId) return ChainError.MISMATCHED_TOKEN_CHAINS
    if (chainId && tokenChainId && chainId !== tokenChainId) return ChainError.MISMATCHED_CHAINS
    return
  }, [chainId, inputChainId, outputChainId, isActivating, isActive, isSupported, tokenChainId])

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(amount, (isExactInput(type) ? inputCurrency : outputCurrency) ?? undefined),
    [amount, type, inputCurrency, outputCurrency]
  )
  const hasAmounts = inputCurrency && outputCurrency && parsedAmount && !isWrap
  const trade = useRouterTrade(
    type,
    hasAmounts ? parsedAmount : undefined,
    hasAmounts ? (isExactInput(type) ? outputCurrency : inputCurrency) : undefined,
    isWrap || error ? RouterPreference.SKIP : RouterPreference.TRADE,
    routerUrl
  )

  // Use the parsed amount when applicable (exact amounts and wraps) immediately responsive UI.
  const [inputAmount, outputAmount] = useMemo(() => {
    if (isWrap) {
      return isExactInput(type)
        ? [parsedAmount, tryParseCurrencyAmount(amount, outputCurrency)]
        : [tryParseCurrencyAmount(amount, inputCurrency), parsedAmount]
    }
    return isExactInput(type) ? [parsedAmount, trade.trade?.outputAmount] : [trade.trade?.inputAmount, parsedAmount]
  }, [
    amount,
    inputCurrency,
    isWrap,
    outputCurrency,
    parsedAmount,
    trade.trade?.inputAmount,
    trade.trade?.outputAmount,
    type,
  ])
  const currencies = useMemo(() => [inputCurrency, outputCurrency], [inputCurrency, outputCurrency])
  const [inputBalance, outputBalance] = useCurrencyBalances(account, currencies)
  const [inputUSDCValue, outputUSDCValue] = [useUSDCValue(inputAmount), useUSDCValue(outputAmount)]

  // Compute slippage and impact off of the trade so that it refreshes with the trade.
  // Wait until the trade is valid to avoid displaying incorrect intermediate values.
  const slippage = useSlippage(trade)
  const impact = usePriceImpact(trade.trade)

  return useMemo(() => {
    return {
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
      error,
      trade,
      slippage,
      impact,
    }
  }, [
    error,
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
  ])
}

const DEFAULT_SWAP_INFO: SwapInfo = {
  [Field.INPUT]: {},
  [Field.OUTPUT]: {},
  error: ChainError.UNCONNECTED_CHAIN,
  trade: { state: TradeState.INVALID, trade: undefined },
  slippage: DEFAULT_SLIPPAGE,
}

const SwapInfoContext = createContext(DEFAULT_SWAP_INFO)

export function SwapInfoProvider({ children, routerUrl }: PropsWithChildren<{ routerUrl?: string }>) {
  const swap = useAtomValue(swapAtom)
  const swapInfo = useComputeSwapInfo(routerUrl)
  const {
    error,
    trade,
    [Field.INPUT]: { currency: inputCurrency },
    [Field.OUTPUT]: { currency: outputCurrency },
  } = swapInfo

  const { onInitialSwapQuote } = useAtomValue(swapEventHandlersAtom)
  useEffect(() => {
    if (trade.state === TradeState.VALID && trade.trade) {
      onInitialSwapQuote?.(trade.trade)
    }
  }, [onInitialSwapQuote, swap, trade])

  const { connector } = useWeb3React()
  const switchChain = useSwitchChain()
  const inputChainId = inputCurrency?.chainId
  const outputChainId = outputCurrency?.chainId
  const tokenChainId = inputChainId || outputChainId
  const { network } = useConnectors()
  // The network connector should be auto-switched, as it is a read-only interface that should "just work".
  if (error === ChainError.MISMATCHED_CHAINS && tokenChainId && connector === network) {
    delete swapInfo.error // avoids flashing an error whilst switching
    switchChain(tokenChainId)
  }

  return <SwapInfoContext.Provider value={swapInfo}>{children}</SwapInfoContext.Provider>
}

/** Requires that SwapInfoUpdater be installed in the DOM tree. **/
export default function useSwapInfo(): SwapInfo {
  return useContext(SwapInfoContext)
}
