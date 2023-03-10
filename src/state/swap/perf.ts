import { Token } from '@uniswap/sdk-core'
import { GetQuoteArgs, InterfaceTrade, TradeResult } from 'state/routing/types'
import {
  ApprovalTransactionInfo,
  SwapTransactionInfo,
  UnwrapTransactionInfo,
  WrapTransactionInfo,
} from 'state/transactions'

/**
 * An integration hook called when a new quote is fetched.
 * @param quote resolves with the quote when it is available.
 */
export type OnSwapQuote = (args: Omit<GetQuoteArgs, 'provider' | 'onQuote'>, quote: Promise<TradeResult>) => void

/**
 * An integration hook called when requesting token approval from the user for Permit2.
 * NB: You may instrument the time-to-confirmation by calling ransaction.response.wait().
 * @param transaction resolves with the approval transaction info when it is granted.
 */
export type OnSwapApproveToken = (token: Token, transaction: Promise<ApprovalTransactionInfo>) => void

/**
 * An integration hook called when requesting a router permit for a token from the user through Permit2.
 * @param signed resolves when the permit is signed.
 */
export type OnSwapPermitRouter = (token: Token, signed: Promise<void>) => void

/**
 * An integration hook called when sending a swap transaction to the mempool through the user.
 * NB: You may instrument the time-to-confirmation by calling ransaction.response.wait().
 * @param transaction resolves with the swap transaction info when it is sent to the mempool.
 */
export type OnSwapSend = (
  trade: InterfaceTrade,
  transaction: Promise<SwapTransactionInfo | WrapTransactionInfo | UnwrapTransactionInfo>
) => void

export interface PerfEventHandlers {
  onSwapQuote?: OnSwapQuote
  // TODO(zzmp)
  onSwapApproveToken?: OnSwapApproveToken
  // TODO(zzmp)
  onSwapPermitRouter?: OnSwapPermitRouter
  // TODO(zzmp)
  onSwapSend?: OnSwapSend
}
