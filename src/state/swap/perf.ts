import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
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
 * An integration hook called when requesting a token allowance from the user.
 * NB: You may instrument the time-to-confirmation by calling transaction.response.wait().
 * @param transaction resolves with the approval transaction info when it is granted.
 */
export type OnTokenAllowance = (
  args: { token: Token; spender: string },
  transaction: Promise<ApprovalTransactionInfo>
) => void

/**
 * An integration hook called when requesting a Permit2 token allowance from the user.
 * @param signed resolves when the permit is signed.
 */
export type OnPermit2Allowance = (args: { token: Token; spender: string }, signed: Promise<void>) => void

/**
 * An integration hook called when sending a swap transaction to the mempool through the user.
 * NB: You may instrument the time-to-confirmation by calling ransaction.response.wait().
 * @param transaction resolves with the swap transaction info when it is sent to the mempool.
 *                    A void transaction indicates user rejection.
 */
export type OnSwapSend = (args: { trade: InterfaceTrade }, transaction: Promise<SwapTransactionInfo | void>) => void

/**
 * An integration hook called when sending a swap transaction to the mempool through the user.
 * NB: You may instrument the time-to-confirmation by calling ransaction.response.wait().
 * @param transaction resolves with the swap transaction info when it is sent to the mempool.
 *                    A void transaction indicates user rejection.
 */
export type OnWrapSend = (
  args: { amount: CurrencyAmount<Currency> },
  transaction: Promise<WrapTransactionInfo | UnwrapTransactionInfo | void>
) => void

export interface PerfEventHandlers {
  onSwapQuote?: OnSwapQuote
  onTokenAllowance?: OnTokenAllowance
  onPermit2Allowance?: OnPermit2Allowance
  onSwapSend?: OnSwapSend
  onWrapSend?: OnWrapSend
}
