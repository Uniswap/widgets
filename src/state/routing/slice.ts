import { BaseQueryFn, createApi, SkipToken, skipToken } from '@reduxjs/toolkit/query/react'
import ms from 'ms.macro'
import { quote } from 'wido'

import { serializeGetQuoteArgs } from './args'
import { GetQuoteArgs, GetQuoteResult, NO_ROUTE } from './types'

const baseQuery: BaseQueryFn<GetQuoteArgs, GetQuoteResult> = () => {
  return { error: { reason: 'Unimplemented baseQuery' } }
}

export const routing = createApi({
  reducerPath: 'routing',
  baseQuery,
  serializeQueryArgs: serializeGetQuoteArgs,
  endpoints: (build) => ({
    getQuote: build.query({
      async queryFn(args: GetQuoteArgs | SkipToken) {
        if (args === skipToken) return { error: { status: 'CUSTOM_ERROR', error: 'Skipped' } }

        try {
          const {
            tokenInAddress,
            tokenInChainId,
            tokenOutAddress,
            tokenOutChainId,
            amount,
            userAddress,
            recipientAddress,
            slippagePercentage,
            partner,
          } = args

          const quoteResult = await quote({
            fromToken: tokenInAddress,
            fromChainId: tokenInChainId as any, // TODO(Daniel)
            toToken: tokenOutAddress,
            toChainId: tokenOutChainId as any, // TODO(Daniel)
            amount: amount ?? undefined,
            user: userAddress,
            recipient: recipientAddress,
            slippagePercentage,
            partner,
          })

          // NO_ROUTE should be treated as a valid response to prevent retries.
          if (!quoteResult.isSupported) {
            return { data: NO_ROUTE as GetQuoteResult }
          }

          return { data: quoteResult }
        } catch (error: any) {
          console.error(`GetQuote failed on routing API: ${error?.message ?? error?.detail ?? error}`)
          return { error: { status: 'CUSTOM_ERROR', error: error?.message ?? error?.detail ?? error } }
        }
      },
      keepUnusedDataFor: ms`10s`,
    }),
  }),
})

export const { useLazyGetQuoteQuery } = routing
export const useGetQuoteQueryState = routing.endpoints.getQuote.useQueryState
