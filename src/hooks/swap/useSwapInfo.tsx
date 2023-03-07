import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { useWeb3React } from '@web3-react/core'
import { QuoteType } from 'hooks/routing/types'
import { useRouterTrade } from 'hooks/routing/useRouterTrade'
import { useCurrencyBalances } from 'hooks/useCurrencyBalance'
import useOnSupportedNetwork from 'hooks/useOnSupportedNetwork'
import usePermit2Allowance, { Allowance, AllowanceState } from 'hooks/usePermit2Allowance'
import { PriceImpact, useFiatValueChange, usePriceImpact } from 'hooks/usePriceImpact'
import useSlippage, { DEFAULT_SLIPPAGE, Slippage } from 'hooks/useSlippage'
import { usePermit2 as usePermit2Enabled } from 'hooks/useSyncFlags'
import useUSDCPrice, { useUSDCValue } from 'hooks/useUSDCPrice'
import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { Field, swapAtom, swapEventHandlersAtom } from 'state/swap'
import { routerPreferenceAtom } from 'state/swap/settings'
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
  error?: ChainError
  trade: {
    state: TradeState
    trade?: InterfaceTrade
    gasUseEstimateUSD?: CurrencyAmount<Token>
  }
  approval: SwapApproval
  allowance: Allowance
  slippage: Slippage
  impact?: PriceImpact
  fiatValueChange?: PriceImpact
}

/** Returns the best computed swap (trade/wrap). */
function useComputeSwapInfo(): SwapInfo {
  const { account, chainId, isActivating, isActive } = useWeb3React()
  const isSupported = useOnSupportedNetwork()
  const { type, amount, [Field.INPUT]: currencyIn, [Field.OUTPUT]: currencyOut } = useAtomValue(swapAtom)
  const isWrap = useIsWrap()

  const chainIdIn = currencyIn?.chainId
  const chainIdOut = currencyOut?.chainId
  const tokenChainId = chainIdIn || chainIdOut
  const error = useMemo(() => {
    if (!isActive) return isActivating ? ChainError.ACTIVATING_CHAIN : ChainError.UNCONNECTED_CHAIN
    if (!isSupported) return ChainError.UNSUPPORTED_CHAIN
    if (chainIdIn && chainIdOut && chainIdIn !== chainIdOut) return ChainError.MISMATCHED_TOKEN_CHAINS
    if (chainId && tokenChainId && chainId !== tokenChainId) return ChainError.MISMATCHED_CHAINS
    return
  }, [chainId, chainIdIn, chainIdOut, isActivating, isActive, isSupported, tokenChainId])

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(amount, isExactInput(type) ? currencyIn : currencyOut),
    [amount, currencyIn, currencyOut, type]
  )

  const [routerPreference] = useAtom(routerPreferenceAtom)

  const trade = useRouterTrade(
    type,
    parsedAmount,
    currencyIn,
    currencyOut,
    isWrap || error ? { type: QuoteType.SKIP } : { preference: routerPreference, type: QuoteType.TRADE }
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
  const [balanceIn, balanceOut] = useCurrencyBalances(account, currencies)
  const [usdcIn, usdcOut] = [useUSDCValue(amountIn), useUSDCValue(amountOut)]

  // Initialize USDC prices for otherCurrency so that it is available sooner after the trade loads.
  useUSDCPrice(isExactInput(type) ? currencyOut : currencyIn)

  // Compute slippage and impact off of the trade so that it refreshes with the trade.
  // Wait until the trade is valid to avoid displaying incorrect intermediate values.
  const slippage = useSlippage(trade)
  const impact = usePriceImpact(trade.trade)
  const fiatValueChange = useFiatValueChange(trade.trade)

  const permit2Enabled = usePermit2Enabled()
  const maximumAmountIn = useMemo(() => {
    const maximumAmountIn = trade.trade?.maximumAmountIn(slippage.allowed)
    return maximumAmountIn?.currency.isToken ? (maximumAmountIn as CurrencyAmount<Token>) : undefined
  }, [slippage.allowed, trade.trade])
  const approval = useSwapApproval(permit2Enabled ? undefined : maximumAmountIn)
  const allowance = usePermit2Allowance(
    permit2Enabled ? maximumAmountIn : undefined,
    permit2Enabled && chainId ? UNIVERSAL_ROUTER_ADDRESS(chainId) : undefined
  )

  return useMemo(() => {
    return {
      [Field.INPUT]: {
        currency: currencyIn,
        amount: amountIn,
        balance: balanceIn,
        usdc: usdcIn,
      },
      [Field.OUTPUT]: {
        currency: currencyOut,
        amount: amountOut,
        balance: balanceOut,
        usdc: usdcOut,
      },
      error,
      trade,
      approval,
      allowance,
      slippage,
      impact,
      fiatValueChange,
    }
  }, [
    allowance,
    amountIn,
    amountOut,
    approval,
    balanceIn,
    balanceOut,
    currencyIn,
    currencyOut,
    error,
    fiatValueChange,
    impact,
    slippage,
    trade,
    usdcIn,
    usdcOut,
  ])
}

const DEFAULT_SWAP_INFO: SwapInfo = {
  [Field.INPUT]: {},
  [Field.OUTPUT]: {},
  error: ChainError.UNCONNECTED_CHAIN,
  trade: { state: TradeState.INVALID, trade: undefined },
  approval: { state: SwapApprovalState.APPROVED },
  allowance: { state: AllowanceState.LOADING },
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
