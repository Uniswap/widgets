import { BaseProvider } from '@ethersproject/providers'
import { isPlainObject } from '@reduxjs/toolkit'
import { SkipToken, skipToken } from '@reduxjs/toolkit/query/react'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { RouterPreference } from 'hooks/routing/types'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useMemo } from 'react'

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
    provider,
    tradeType,
    amountSpecified,
    currencyIn,
    currencyOut,
    routerPreference,
  }: Partial<{
    provider: BaseProvider
    tradeType: TradeType
    amountSpecified: CurrencyAmount<Currency>
    currencyIn: Currency
    currencyOut: Currency
    routerPreference: RouterPreference
  }>,
  skip?: boolean
): GetQuoteArgs | SkipToken {
  console.log('📜 LOG > skip', skip)
  const args = useMemo(() => {
    console.log('📜 LOG > args > tradeType', tradeType)
    if (!provider || tradeType === undefined) return null
    if (!currencyIn || !currencyOut || currencyIn.equals(currencyOut)) return null

    return {
      amount: amountSpecified?.quotient.toString() ?? null,
      tokenInAddress: currencyIn.wrapped.address,
      tokenInChainId: currencyIn.wrapped.chainId,
      tokenInDecimals: currencyIn.wrapped.decimals,
      tokenInSymbol: currencyIn.wrapped.symbol,
      tokenOutAddress: currencyOut.wrapped.address,
      tokenOutChainId: currencyOut.wrapped.chainId,
      tokenOutDecimals: currencyOut.wrapped.decimals,
      tokenOutSymbol: currencyOut.wrapped.symbol,
      routerPreference,
      tradeType,
      provider,
    }
  }, [provider, amountSpecified, tradeType, currencyIn, currencyOut, routerPreference])

  const isWindowVisible = useIsWindowVisible()
  console.log('📜 LOG > isWindowVisible', isWindowVisible)
  if (skip || !isWindowVisible) return skipToken

  console.log('📜 LOG > args', args)
  return args ?? skipToken
}
