import { BaseProvider } from '@ethersproject/providers'
import { isPlainObject } from '@reduxjs/toolkit'
import { SkipToken, skipToken } from '@reduxjs/toolkit/query/react'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { QuoteConfig, QuoteType } from 'hooks/routing/types'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { swapEventHandlersAtom, swapRouterUrlAtom } from 'state/swap'

import { GetQuoteArgs } from './types'
import { currencyAddressForSwapQuote } from './utils'

const NON_SERIALIZABLE_KEYS = ['provider', 'onQuote']

export function serializeGetQuoteArgs(args: GetQuoteArgs) {
  return JSON.stringify(args, (key, value) => {
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
  })
}

/** Omits the non-serializable keys from GetQuoteArgs' cache key. */
export function serializeGetQuoteQueryArgs({
  endpointName,
  queryArgs,
}: {
  endpointName: string
  queryArgs: GetQuoteArgs
}) {
  return `${endpointName}(${serializeGetQuoteArgs(queryArgs)})`
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
  }: Partial<{
    provider: BaseProvider
    tradeType: TradeType
    amountSpecified: CurrencyAmount<Currency>
    currencyIn: Currency
    currencyOut: Currency
  }>,
  quoteConfig: QuoteConfig
): GetQuoteArgs | SkipToken {
  const routerUrl = useAtomValue(swapRouterUrlAtom)
  const { onSwapQuote } = useAtomValue(swapEventHandlersAtom)
  const args = useMemo(() => {
    if (!provider || tradeType === undefined) return null
    if (!currencyIn || !currencyOut || currencyIn.equals(currencyOut)) return null
    if (quoteConfig.type === QuoteType.SKIP) return null

    return {
      amount: amountSpecified?.quotient.toString() ?? null,
      tokenInAddress: currencyAddressForSwapQuote(currencyIn),
      tokenInChainId: currencyIn.chainId,
      tokenInDecimals: currencyIn.decimals,
      tokenInSymbol: currencyIn.symbol,
      tokenOutAddress: currencyAddressForSwapQuote(currencyOut),
      tokenOutChainId: currencyOut.chainId,
      tokenOutDecimals: currencyOut.decimals,
      tokenOutSymbol: currencyOut.symbol,
      routerPreference: quoteConfig.preference,
      routerUrl,
      tradeType,
      provider,
      quoteType: quoteConfig.type,
      onQuote: onSwapQuote,
    }
  }, [amountSpecified?.quotient, currencyIn, currencyOut, onSwapQuote, provider, quoteConfig, routerUrl, tradeType])

  const isWindowVisible = useIsWindowVisible()
  if (quoteConfig.type === QuoteType.SKIP || !isWindowVisible) return skipToken

  return args ?? skipToken
}
