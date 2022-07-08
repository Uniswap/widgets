import { BaseProvider, JsonRpcBatchProvider } from '@ethersproject/providers'
import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Protocol } from '@uniswap/router-sdk'
// eslint-disable-next-line no-restricted-imports
import { ChainId } from '@uniswap/smart-order-router'
import { AUTO_ROUTER_SUPPORTED_CHAINS } from 'hooks/routing/clientSideSmartOrderRouter'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import ms from 'ms.macro'
import qs from 'qs'

import { GetQuoteResult } from './types'

const routerProviders = new Map<ChainId, BaseProvider>()
// TODO: for fallback jsonRpcEndpoints, cloudflare-eth.com does not support eth_feeHistory, which we need for the router :/
// is there any downside to just using the (free) flashbots RPC endpoints instead? https://docs.flashbots.net/flashbots-protect/rpc/ratelimiting
function getRouterProvider(chainId: ChainId): BaseProvider {
  const provider = routerProviders.get(chainId)
  if (provider) return provider

  const { library } = useActiveWeb3React()

  if (AUTO_ROUTER_SUPPORTED_CHAINS.includes(chainId)) {
    const provider = library as JsonRpcBatchProvider
    routerProviders.set(chainId, provider)
    return provider
  }

  throw new Error(`Router does not support this chain (chainId: ${chainId}).`)
}

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
          type,
        } = args

        async function getClientSideQuote() {
          const chainId = args.tokenInChainId
          const params = { chainId, provider: getRouterProvider(chainId) }
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
