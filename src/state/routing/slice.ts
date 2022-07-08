import { BaseProvider } from '@ethersproject/providers'
import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Protocol } from '@uniswap/router-sdk'
// eslint-disable-next-line no-restricted-imports
import { ChainId } from '@uniswap/smart-order-router'
import ms from 'ms.macro'
import qs from 'qs'

import { GetQuoteResult } from './types'

const protocols: Protocol[] = [Protocol.V2, Protocol.V3]

const DEFAULT_QUERY_PARAMS = {
  protocols: protocols.map((p) => p.toLowerCase()).join(','),
  // example other params
  // forceCrossProtocol: 'true',
  // minSplits: '5',
}

export const routingApi = createApi({
  reducerPath: 'routingApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
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
        baseUrl?: string
        useClientSideRouter: boolean // included in key to invalidate on change
        provider: BaseProvider
        type: 'exactIn' | 'exactOut'
      }
    >({
      async queryFn(args, _api, _extraOptions) {
        const {
          tokenInAddress,
          tokenInChainId,
          tokenOutAddress,
          tokenOutChainId,
          amount,
          baseUrl,
          useClientSideRouter, // TODO(kristiehuang): check with Alex about enabling settings toggle? O/w - remove this param; rn it simply checks if baseUrl is falsy
          provider,
          type,
        } = args

        async function getClientSideQuote() {
          const params = { chainId: tokenInChainId, provider }
          return await (
            await import('../../hooks/routing/clientSideSmartOrderRouter')
          ).getClientSideQuote(args, params, { protocols })
        }

        let result
        if (useClientSideRouter) {
          // If integrator did not provide a routing API URL param, use client-side SOR
          result = await getClientSideQuote()
        } else {
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
            const response = await global.fetch(`${baseUrl}quote?${query}`)
            if (!response.ok) {
              throw new Error(`${response.statusText}: could not get quote from auto-router API`)
            }
            const data = await response.json()
            result = { data }
          } catch (e) {
            console.warn(e)
            result = await getClientSideQuote()
          }
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

export const { useGetQuoteQuery } = routingApi
