import { BaseQueryFn, createApi, SkipToken, skipToken } from '@reduxjs/toolkit/query/react'
import { Protocol } from '@uniswap/router-sdk'
import ms from 'ms.macro'
import qs from 'qs'

import { serializeGetQuoteArgs } from './args'
import { GetQuoteArgs, GetQuoteResult, NO_ROUTE } from './types'

const protocols: Protocol[] = [Protocol.V2, Protocol.V3]

// routing API quote query params: https://github.com/Uniswap/routing-api/blob/main/lib/handlers/quote/schema/quote-schema.ts
const DEFAULT_QUERY_PARAMS = {
  protocols: protocols.map((p) => p.toLowerCase()).join(','),
}

const baseQuery: BaseQueryFn<GetQuoteArgs, GetQuoteResult> = () => {
  return { error: { reason: 'Unimplemented baseQuery' } }
}

const WIDO_URL = 'https://api.joinwido.com'

export const routing = createApi({
  reducerPath: 'routing',
  baseQuery,
  serializeQueryArgs: serializeGetQuoteArgs,
  endpoints: (build) => ({
    getQuote: build.query({
      async queryFn(args: GetQuoteArgs | SkipToken) {
        console.log('📜 LOG > queryFn > args', args)
        if (args === skipToken) return { error: { status: 'CUSTOM_ERROR', error: 'Skipped' } }

        if (
          // If enabled, try the routing API, falling back to client-side routing.
          // args.routerPreference === RouterPreference.API &&
          // A null amount may be passed to initialize the client-side routing.
          args.amount !== null
        ) {
          try {
            const { tokenInAddress, tokenInChainId, tokenOutAddress, tokenOutChainId, amount, tradeType } = args
            // const type = isExactInput(tradeType) ? 'exactIn' : 'exactOut'
            const query = qs.stringify({
              ...DEFAULT_QUERY_PARAMS,
              from_token: tokenInAddress,
              from_chain_id: tokenInChainId,
              to_token: tokenOutAddress,
              to_chain_id: tokenOutChainId,
              amount,
              // type,
            })
            const response = await global.fetch(`${WIDO_URL}quote_v2?${query}`)
            if (!response.ok) {
              let data: string | Record<string, unknown> = await response.text()
              try {
                data = JSON.parse(data)
              } catch {}

              // NO_ROUTE should be treated as a valid response to prevent retries.
              if (typeof data === 'object' && data.errorCode === 'NO_ROUTE') {
                return { data: NO_ROUTE as GetQuoteResult }
              }

              throw data
            }

            let quote = await response.json()
            quote = {
              blockNumber: '16526836',
              amount: '500000000000000000',
              amountDecimals: '0.5',
              quote: '786987582426486994240',
              quoteDecimals: '786.98758242648699424',
              quoteGasAdjusted: '783971374786134044482',
              quoteGasAdjustedDecimals: '783.971374786134044482',
              gasUseEstimateQuote: '3016207640352949757',
              gasUseEstimateQuoteDecimals: '3.016207640352949757',
              gasUseEstimate: '113000',
              gasUseEstimateUSD: '3.016207640352949757',
              simulationStatus: 'UNATTEMPTED',
              simulationError: false,
              gasPriceWei: '16949321079',
              route: [
                [
                  {
                    type: 'v3-pool',
                    address: '0x60594a405d53811d3BC4766596EFD80fd545A270',
                    tokenIn: {
                      chainId: 1,
                      decimals: 18,
                      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                      symbol: 'WETH',
                    },
                    tokenOut: {
                      chainId: 1,
                      decimals: 18,
                      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                      symbol: 'DAI',
                    },
                    fee: '500',
                    liquidity: '592508059350277918368151',
                    sqrtRatioX96: '1996477136390619641562383912',
                    tickCurrent: '-73623',
                    amountIn: '500000000000000000',
                    amountOut: '786987582426486994240',
                  },
                ],
              ],
              routeString: '[V3] 100.00% = WETH -- 0.05% [0x60594a405d53811d3BC4766596EFD80fd545A270] --> DAI',
              quoteId: '3f745',
              // quote: quote.to_token_amount,
            } as GetQuoteResult
            return { data: quote }
          } catch (error: any) {
            console.warn(
              `GetQuote failed on routing API, falling back to client: ${error?.message ?? error?.detail ?? error}`
            )
          }
        }

        return { error: { status: 'HMMM', error: 'Not sure' } }
      },
      keepUnusedDataFor: ms`100s`,
    }),
  }),
})

export const { useLazyGetQuoteQuery } = routing
export const useGetQuoteQueryState = routing.endpoints.getQuote.useQueryState
