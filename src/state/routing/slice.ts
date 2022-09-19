import { JsonRpcProvider } from '@ethersproject/providers'
import { isPlainObject } from '@reduxjs/toolkit'
import { createApi } from '@reduxjs/toolkit/query/react'
import { Protocol } from '@uniswap/router-sdk'
import { TradeType } from '@uniswap/sdk-core'
// Importing just the type, so smart-order-router is lazy-loaded
// eslint-disable-next-line no-restricted-imports
import type { ChainId } from '@uniswap/smart-order-router'
import ms from 'ms.macro'
import qs from 'qs'

import { GetQuoteResult } from './types'

const protocols: Protocol[] = [Protocol.V2, Protocol.V3]

// routing API quote query params: https://github.com/Uniswap/routing-api/blob/main/lib/handlers/quote/schema/quote-schema.ts
const DEFAULT_QUERY_PARAMS = {
  protocols: protocols.map((p) => p.toLowerCase()).join(','),
}

const serializeRoutingCacheKey = ({ endpointName, queryArgs }: { endpointName: string; queryArgs: any }) => {
  // same as default serializeQueryArgs, but ignoring the non-serializable (and interchangeable) provider.
  return `${endpointName}(${JSON.stringify(queryArgs, (key, value) => {
    if (key === 'provider') {
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

export const routing = createApi({
  reducerPath: 'routing',
  baseQuery: async () => {
    return await (await global.fetch('/')).json()
  },
  serializeQueryArgs: serializeRoutingCacheKey, // need to write custom cache key fxn to handle non-serializable JsonRpcProvider provider
  endpoints: (build) => ({
    getQuote: build.query<
      GetQuoteResult,
      {
        tokenInAddress: string
        tokenInChainId: ChainId
        tokenInDecimals: number
        tokenInSymbol?: string
        tokenOutAddress: string
        tokenOutChainId: ChainId
        tokenOutDecimals: number
        tokenOutSymbol?: string
        amount: string
        routerUrl?: string
        provider: JsonRpcProvider
        tradeType: TradeType
      }
    >({
      async queryFn(args, { signal }) {
        const {
          tokenInAddress,
          tokenInChainId,
          tokenOutAddress,
          tokenOutChainId,
          amount,
          routerUrl,
          provider,
          tradeType,
        } = args

        async function getClientSideQuote() {
          // Lazy-load the client-side router to improve initial pageload times.
          return await (
            await import('../../hooks/routing/clientSideSmartOrderRouter')
          ).getClientSideQuote(args, provider, { protocols })
        }

        // Debounce is used to prevent excessive requests to SOR, as it is data intensive.
        await new Promise((resolve) => setTimeout(resolve, 200))
        if (signal.aborted) {
          return { error: { status: 'FETCH_ERROR', error: 'query aborted' } }
        }

        // If enabled, try routing API, falling back to clientside SOR.
        if (Boolean(routerUrl)) {
          try {
            const query = qs.stringify({
              ...DEFAULT_QUERY_PARAMS,
              tokenInAddress,
              tokenInChainId,
              tokenOutAddress,
              tokenOutChainId,
              amount,
              type: tradeType === TradeType.EXACT_INPUT ? 'exactIn' : 'exactOut',
            })
            // We explicitly do *not* abort an ongoing fetch, because the server will not recognize/react to it.
            // It is better to just cache the result to avoid refetching it in the near future.
            const response = await global.fetch(`${routerUrl}quote?${query}`)
            if (!response.ok) {
              return { error: { status: response.status, data: await response.text() } }
            }

            return response.json() as Promise<{ data: GetQuoteResult }>
          } catch (e) {
            console.warn(e)
          }
        }

        // If integrator did not provide a routing API URL param, use clientside SOR
        try {
          return getClientSideQuote()
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e.message } }
        }
      },
      keepUnusedDataFor: ms`10s`,
    }),
  }),
})

export const { useLazyGetQuoteQuery } = routing
