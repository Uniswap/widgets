import { isPlainObject } from '@reduxjs/toolkit'
import { SkipToken, skipToken } from '@reduxjs/toolkit/query/react'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { RouterPreference } from 'hooks/routing/types'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { DEFAULT_SLIPPAGE_PERCENT, toPercent } from 'hooks/useSlippage'
import { useSnAccountAddress } from 'hooks/useSyncWidgetSettings'
import { NATIVE_ADDRESS } from 'hooks/useTokenList/utils'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { slippageAtom } from 'state/swap/settings'
import { isStarknetChain } from 'utils/starknet'

import { GetQuoteArgs } from './types'

const NON_SERIALIZABLE_KEYS = ['provider']

/** Omits the non-serializable keys from GetQuoteArgs' cache key. */
export function serializeGetQuoteArgs({ endpointName, queryArgs }: { endpointName: string; queryArgs: GetQuoteArgs }) {
  // same as default serializeQueryArgs, but ignoring non-serializable keys.
  return `${endpointName}(${JSON.stringify(queryArgs, (key, value) => {
    if (NON_SERIALIZABLE_KEYS.includes(key)) {
      return undefined
    }
    if (isPlainObject(value)) {
      return Object.keys(value)
        .sort()
        .reduce<any>((acc, key) => {
          acc[key] = (value as any)[key]
          return acc
        }, {})
    } else {
      return value
    }
  })})`
}

/**
 * Returns GetQuoteArgs for the Routing API query or SkipToken if the query should be skipped
 * (this includes if the window is not visible).
 * NB: Input arguments do not need to be memoized, as they will be destructured.
 */
export function useGetQuoteArgs(
  {
    tradeType,
    amountSpecified,
    currencyIn,
    currencyOut,
    routerPreference,
    account,
  }: Partial<{
    tradeType: TradeType
    amountSpecified: CurrencyAmount<Currency>
    currencyIn: Currency
    currencyOut: Currency
    routerPreference: RouterPreference
    account?: string
  }>,
  skip?: boolean
): GetQuoteArgs | SkipToken {
  const snAccount = useSnAccountAddress()
  const [slippage] = useAtom(slippageAtom)

  const args = useMemo(() => {
    if (!currencyIn || !currencyOut || currencyIn.equals(currencyOut)) return null
    if (!amountSpecified) return null

    const slippagePercentage =
      slippage.default || !slippage.max
        ? DEFAULT_SLIPPAGE_PERCENT.divide(100).toSignificant()
        : (toPercent(slippage.max) as Percent).divide(100).toSignificant()

    return {
      amount: amountSpecified.quotient.toString(),
      tokenInAddress: currencyIn.isNative ? NATIVE_ADDRESS : currencyIn.address,
      tokenInChainId: currencyIn.chainId,
      tokenInDecimals: currencyIn.decimals,
      tokenInSymbol: currencyIn.symbol,
      tokenOutAddress: currencyOut.isNative ? NATIVE_ADDRESS : currencyOut.address,
      tokenOutChainId: currencyOut.chainId,
      tokenOutDecimals: currencyOut.decimals,
      tokenOutSymbol: currencyOut.symbol,
      userAddress: isStarknetChain(currencyIn?.chainId) ? snAccount : account,
      recipientAddress: isStarknetChain(currencyOut?.chainId) ? snAccount : account,
      slippagePercentage: parseFloat(slippagePercentage),
      routerPreference,
      tradeType,
    }
  }, [slippage, amountSpecified, tradeType, currencyIn, currencyOut, routerPreference, account, snAccount])

  const isWindowVisible = useIsWindowVisible()
  if (skip || !isWindowVisible) return skipToken

  return args ?? skipToken
}
