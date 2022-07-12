import { JsonRpcProvider } from '@ethersproject/providers'
import { isPlainObject } from '@reduxjs/toolkit'
import type { BaseQueryArg, BaseQueryFn } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { SerializeQueryArgs } from '@reduxjs/toolkit/dist/query/defaultSerializeQueryArgs'
import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Protocol } from '@uniswap/router-sdk'
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

const serializeRoutingCacheKey: SerializeQueryArgs<any> = ({ endpointName, queryArgs }) => {
  // take the query arguments, sort object keys where applicable, stringify the result, and concatenate it with the endpoint name
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
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  serializeQueryArgs: serializeRoutingCacheKey,
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
        type: 'exactIn' | 'exactOut'
      }
    >({
      async queryFn(args, _api, _extraOptions) {
        const { tokenInAddress, tokenInChainId, tokenOutAddress, tokenOutChainId, amount, routerUrl, provider, type } =
          args

        async function getClientSideQuote() {
          // Lazy-load the smart order router to improve initial pageload times.
          return await (
            await import('../../hooks/routing/clientSideSmartOrderRouter')
          ).getClientSideQuote(args, provider, { protocols })
        }

        let result
        if (Boolean(routerUrl)) {
          // Try routing API, fallback to SOR
          try {
            const query = qs.stringify({
              ...DEFAULT_QUERY_PARAMS,
              tokenInAddress,
              tokenInChainId,
              tokenOutAddress,
              tokenOutChainId,
              amount,
              type,
            })
            const response = await global.fetch(`${routerUrl}quote?${query}`)
            if (!response.ok) {
              throw new Error(`${response.statusText}: could not get quote from auto-router API`)
            }
            const data = await response.json()
            console.log(data)
            result = { data }
          } catch (e) {
            console.warn(e)
            result = await getClientSideQuote()
          }
        } else {
          // If integrator did not provide a routing API URL param, use client-side SOR
          result = await getClientSideQuote()
        }
        if (result?.error) return { error: result.error as FetchBaseQueryError }
        return { data: result?.data as GetQuoteResult }
      },
      keepUnusedDataFor: ms`10s`,
      extraOptions: {
        maxRetries: 0,
      },
    }),
  }),
})

export const { useGetQuoteQuery } = routing
