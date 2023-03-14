import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { RouterPreference } from 'hooks/routing/types'
import { useRouterTrade } from 'hooks/routing/useRouterTrade'
import { useCurrencyBalances } from 'hooks/useCurrencyBalance'
import { PriceImpact, usePriceImpact } from 'hooks/usePriceImpact'
import useSlippage, { DEFAULT_SLIPPAGE, Slippage } from 'hooks/useSlippage'
import { useEvmAccountAddress, useEvmChainId, useSnChainId } from 'hooks/useSyncWidgetSettings'
import { useAtomValue } from 'jotai/utils'
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react'
import { TradeState, WidoTrade } from 'state/routing/types'
import { Field, swapAtom, swapEventHandlersAtom } from 'state/swap'
import { isStarknetChain } from 'utils/starknet'
import { isExactInput } from 'utils/tradeType'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'

import { SwapApproval, SwapApprovalState, useSwapApproval } from './useSwapApproval'
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
  error?: ChainError | string
  trade: {
    state: TradeState
    trade?: WidoTrade
    gasUseEstimateUSD?: CurrencyAmount<Token>
  }
  approval: SwapApproval
  slippage: Slippage
  impact?: PriceImpact
}

/** Returns the best computed swap (trade/wrap). */
function useComputeSwapInfo(): SwapInfo {
  const evmChainId = useEvmChainId()
  const evmAccount = useEvmAccountAddress()
  const snChainId = useSnChainId()
  const { type, amount, [Field.INPUT]: currencyIn, [Field.OUTPUT]: currencyOut } = useAtomValue(swapAtom)
  const isWrap = useIsWrap()

  const chainIdIn = currencyIn?.chainId
  const error = useMemo(() => {
    if (chainIdIn && isStarknetChain(chainIdIn) && snChainId && snChainId !== chainIdIn) {
      return ChainError.MISMATCHED_CHAINS
    }
    if (chainIdIn && !isStarknetChain(chainIdIn) && evmChainId && evmChainId !== chainIdIn)
      return ChainError.MISMATCHED_CHAINS
    return
  }, [chainIdIn, evmChainId, snChainId])

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(amount, isExactInput(type) ? currencyIn : currencyOut),
    [amount, currencyIn, currencyOut, type]
  )

  const trade = useRouterTrade(
    type,
    parsedAmount,
    currencyIn,
    currencyOut,
    // isWrap || error ? RouterPreference.SKIP : RouterPreference.API,
    RouterPreference.API,
    evmAccount
  )

  // Use the parsed amount when applicable (exact amounts and wraps) immediately responsive UI.
  const [amountIn, amountOut] = useMemo(() => {
    if (isWrap) {
      return isExactInput(type)
        ? [parsedAmount, tryParseCurrencyAmount(amount, currencyOut)]
        : [tryParseCurrencyAmount(amount, currencyIn), parsedAmount]
    }
    return isExactInput(type) ? [parsedAmount, trade.trade?.outputAmount] : [trade.trade?.inputAmount, parsedAmount]
  }, [amount, currencyIn, currencyOut, isWrap, parsedAmount, trade.trade?.inputAmount, trade.trade?.outputAmount, type])
  const currencies = useMemo(() => [currencyIn, currencyOut], [currencyIn, currencyOut])
  const [balanceIn, balanceOut] = useCurrencyBalances(currencies)

  // Compute slippage and impact off of the trade so that it refreshes with the trade.
  // Wait until the trade is valid to avoid displaying incorrect intermediate values.
  const slippage = useSlippage()
  const impact = usePriceImpact(trade.trade)
  const approval = useSwapApproval(trade.trade)

  return useMemo(() => {
    return {
      [Field.INPUT]: {
        currency: currencyIn,
        amount: amountIn,
        balance: balanceIn,
        usdc: trade.trade?.inputAmountUsdValue,
      },
      [Field.OUTPUT]: {
        currency: currencyOut,
        amount: amountOut,
        balance: balanceOut,
        usdc: trade.trade?.outputAmountUsdValue,
      },
      error: trade?.error || error,
      trade,
      approval,
      slippage,
      impact,
    }
  }, [amountIn, amountOut, approval, balanceIn, balanceOut, currencyIn, currencyOut, error, impact, slippage, trade])
}

const DEFAULT_SWAP_INFO: SwapInfo = {
  [Field.INPUT]: {},
  [Field.OUTPUT]: {},
  error: ChainError.UNCONNECTED_CHAIN,
  trade: { state: TradeState.INVALID, trade: undefined },
  approval: { state: SwapApprovalState.APPROVED },
  slippage: DEFAULT_SLIPPAGE,
}

const SwapInfoContext = createContext(DEFAULT_SWAP_INFO)

export function SwapInfoProvider({ children }: PropsWithChildren) {
  const swapInfo = useComputeSwapInfo()
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

  return <SwapInfoContext.Provider value={swapInfo}>{children}</SwapInfoContext.Provider>
}

/** Requires that SwapInfoUpdater be installed in the DOM tree. **/
export default function useSwapInfo(): SwapInfo {
  return useContext(SwapInfoContext)
}
