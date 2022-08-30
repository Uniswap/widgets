import { JsonRpcProvider } from '@ethersproject/providers'
import { isPlainObject } from '@reduxjs/toolkit'
import { createApi, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
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
  // same as default serializeQueryArgs, but we add extra case if key is our non-serializable JsonRpcProvider
  return `${endpointName}(${JSON.stringify(queryArgs, (key, value) => {
    if (key === 'provider') {
      return value?.connection?.url
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
      async queryFn(args, _api, _extraOptions) {
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
          // Lazy-load the clientside router to improve initial pageload times.
          return await (
            await import('../../hooks/routing/clientSideSmartOrderRouter')
          ).getClientSideQuote(args, provider, { protocols })
        }

        let result
        if (Boolean(routerUrl)) {
          // Try routing API, fallback to clientside SOR
          try {
            const query = qs.stringify({
              ...DEFAULT_QUERY_PARAMS,
              tokenInAddress,
              tokenInChainId,
              tokenOutAddress,
              tokenOutChainId,
              amount,
              tradeType,
            })
            const response = await global.fetch(`${routerUrl}quote?${query}`)
            if (!response.ok) {
              throw new Error(`${response.statusText}: could not get quote from auto-router API`)
            }
            const data = await response.json()
            result = { data }
          } catch (e) {
            console.warn(e)
            result = await getClientSideQuote()
          }
        } else {
          // If integrator did not provide a routing API URL param, use clientside SOR
          result = await getClientSideQuote()
        }
        if (result?.error) return { error: result.error as FetchBaseQueryError }
        return { data: result?.data as GetQuoteResult }
      },
      keepUnusedDataFor: ms`10s`,
    }),
  }),
})

export const { useGetQuoteQuery } = routing
