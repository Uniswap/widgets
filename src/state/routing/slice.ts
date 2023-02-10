import { BaseQueryFn, createApi, SkipToken, skipToken } from '@reduxjs/toolkit/query/react'
import { Protocol } from '@uniswap/router-sdk'
import { RouterPreference } from 'hooks/routing/types'
import ms from 'ms.macro'
import qs from 'qs'
import { isExactInput } from 'utils/tradeType'

import { serializeGetQuoteArgs } from './args'
import { GetQuoteArgs, GetQuoteError, NO_ROUTE, QuoteResult, TradeResult } from './types'
import { transformQuoteToTradeResult } from './utils'

const protocols: Protocol[] = [Protocol.V2, Protocol.V3, Protocol.MIXED]

// routing API quote query params: https://github.com/Uniswap/routing-api/blob/main/lib/handlers/quote/schema/quote-schema.ts
const DEFAULT_QUERY_PARAMS = {
  protocols: protocols.map((p) => p.toLowerCase()).join(','),
}

const baseQuery: BaseQueryFn<GetQuoteArgs, TradeQuoteResult> = () => {
  return { error: { reason: 'Unimplemented baseQuery' } }
}

type TradeQuoteResult = TradeResult | GetQuoteError

export const routing = createApi({
  reducerPath: 'routing',
  baseQuery,
  serializeQueryArgs: serializeGetQuoteArgs,
  endpoints: (build) => ({
    getTradeQuote: build.query({
      async queryFn(args: GetQuoteArgs | SkipToken) {
        if (args === skipToken) return { error: { status: 'CUSTOM_ERROR', error: 'Skipped' } }

        if (
          // If enabled, try the routing API, falling back to client-side routing.
          args.routerPreference === RouterPreference.API &&
          Boolean(args.routerUrl) &&
          // A null amount may be passed to initialize the client-side routing.
          args.amount !== null
        ) {
          try {
            const { tokenInAddress, tokenInChainId, tokenOutAddress, tokenOutChainId, amount, tradeType } = args
            const type = isExactInput(tradeType) ? 'exactIn' : 'exactOut'
            const query = qs.stringify({
              ...DEFAULT_QUERY_PARAMS,
              tokenInAddress,
              tokenInChainId,
              tokenOutAddress,
              tokenOutChainId,
              amount,
              type,
            })
            const response = await global.fetch(`${args.routerUrl}quote?${query}`)
            if (!response.ok) {
              let data: string | Record<string, unknown> = await response.text()
              try {
                data = JSON.parse(data)
              } catch {}

              // NO_ROUTE should be treated as a valid response to prevent retries.
              if (typeof data === 'object' && data.errorCode === 'NO_ROUTE') {
                return { data: NO_ROUTE as TradeQuoteResult }
              }

              throw data
            }

            const quote: QuoteResult = await response.json()
            const tradeResult = transformQuoteToTradeResult(args, quote)
            return { data: tradeResult }
          } catch (error: any) {
            console.warn(
              `GetQuote failed on routing API, falling back to client: ${error?.message ?? error?.detail ?? error}`
            )
          }
        }

        // Lazy-load the client-side router to improve initial pageload times.
        const clientSideSmartOrderRouter = await import('../../hooks/routing/clientSideSmartOrderRouter')
        try {
          const quote: QuoteResult | GetQuoteError = await clientSideSmartOrderRouter.getClientSideQuote(args, {
            protocols,
          })
          if (typeof quote === 'string') return { data: quote as TradeQuoteResult }

          const tradeResult = transformQuoteToTradeResult(args, quote)
          return { data: tradeResult }
        } catch (error: any) {
          console.warn(`GetQuote failed on client: ${error}`)
          return { error: { status: 'CUSTOM_ERROR', error: error?.message ?? error?.detail ?? error } }
        }
      },
      keepUnusedDataFor: ms`10s`,
    }),
  }),
})

export const { useLazyGetTradeQuoteQuery } = routing
export const useGetTradeQuoteQueryState = routing.endpoints.getTradeQuote.useQueryState
