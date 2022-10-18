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
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react'
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

// from the current swap inputs, compute the best trade and return it.
function useComputeSwapInfo(routerUrl?: string): SwapInfo {
  const { account, chainId, isActivating, isActive } = useWeb3React()
  const isSupported = useOnSupportedNetwork()
  const { type, amount, [Field.INPUT]: currencyIn, [Field.OUTPUT]: currencyOut } = useAtomValue(swapAtom)
  const isWrap = useIsWrap()

  const chainIn = currencyIn?.chainId
  const chainOut = currencyOut?.chainId
  const tokenChainId = chainIn || chainOut
  const error = useMemo(() => {
    if (!isActive) return isActivating ? ChainError.ACTIVATING_CHAIN : ChainError.UNCONNECTED_CHAIN
    if (!isSupported) return ChainError.UNSUPPORTED_CHAIN
    if (chainIn && chainOut && chainIn !== chainOut) return ChainError.MISMATCHED_TOKEN_CHAINS
    if (chainId && tokenChainId && chainId !== tokenChainId) return ChainError.MISMATCHED_CHAINS
    return
  }, [chainId, chainIn, chainOut, isActivating, isActive, isSupported, tokenChainId])

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(amount, (isExactInput(type) ? currencyIn : currencyOut) ?? undefined),
    [amount, type, currencyIn, currencyOut]
  )
  const hasAmounts = currencyIn && currencyOut && parsedAmount && !isWrap
  const trade = useRouterTrade(
    type,
    hasAmounts ? parsedAmount : undefined,
    hasAmounts ? (isExactInput(type) ? currencyOut : currencyIn) : undefined,
    RouterPreference.TRADE,
    routerUrl
  )

  const amountIn = useMemo(
    () => (isWrap || isExactInput(type) ? parsedAmount : trade.trade?.inputAmount),
    [isWrap, parsedAmount, trade.trade?.inputAmount, type]
  )
  const amountOut = useMemo(
    () => (isWrap || !isExactInput(type) ? parsedAmount : trade.trade?.outputAmount),
    [isWrap, parsedAmount, trade.trade?.outputAmount, type]
  )

  const [balanceIn, balanceOut] = useCurrencyBalances(
    account,
    useMemo(() => [currencyIn, currencyOut], [currencyIn, currencyOut])
  )

  // Compute slippage and impact off of the trade so that it refreshes with the trade.
  // (Using amountIn/amountOut would show (incorrect) intermediate values.)
  const slippage = useSlippage(trade)
  const inputUSDCValue = useUSDCValue(trade.trade?.inputAmount)
  const outputUSDCValue = useUSDCValue(trade.trade?.outputAmount)

  const impact = usePriceImpact(trade.trade, { inputUSDCValue, outputUSDCValue })

  return useMemo(() => {
    return {
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
      error,
      trade,
      slippage,
      impact,
    }
  }, [
    amountIn,
    amountOut,
    balanceIn,
    balanceOut,
    currencyIn,
    currencyOut,
    error,
    impact,
    inputUSDCValue,
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
  const swapInfo = useComputeSwapInfo(routerUrl)

  const swap = useAtomValue(swapAtom)
  const lastQuotedSwap = useRef<typeof swap | null>(null)
  const { onInitialSwapQuote } = useAtomValue(swapEventHandlersAtom)
  useEffect(() => {
    if (swap === lastQuotedSwap.current) return
    if (swapInfo.trade.state === TradeState.VALID && swapInfo.trade.trade) {
      lastQuotedSwap.current = swap
      onInitialSwapQuote?.(swapInfo.trade.trade)
    }
  }, [onInitialSwapQuote, swap, swapInfo.trade.state, swapInfo.trade.trade])

  const {
    error,
    [Field.INPUT]: { currency: currencyIn },
    [Field.OUTPUT]: { currency: currencyOut },
  } = swapInfo
  const { connector } = useWeb3React()
  const switchChain = useSwitchChain()
  const chainIn = currencyIn?.chainId
  const chainOut = currencyOut?.chainId
  const tokenChainId = chainIn || chainOut
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
