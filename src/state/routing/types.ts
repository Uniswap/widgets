import { BigNumber } from '@ethersproject/bignumber'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Price, Token, TradeType } from '@uniswap/sdk-core'
import type { ChainId } from '@uniswap/smart-order-router'
import { RouterPreference } from 'hooks/routing/types'
import { QuoteResult, Step } from 'wido'

export enum TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
}

// from https://github.com/Uniswap/routing-api/blob/main/lib/handlers/schema.ts

export type TokenInRoute = Pick<Token, 'address' | 'chainId' | 'symbol' | 'decimals'>

export type V3PoolInRoute = {
  type: 'v3-pool'
  tokenIn: TokenInRoute
  tokenOut: TokenInRoute
  sqrtRatioX96: string
  liquidity: string
  tickCurrent: string
  fee: string
  amountIn?: string
  amountOut?: string

  // not used in the interface
  address?: string
}

export type V2Reserve = {
  token: TokenInRoute
  quotient: string
}

export type V2PoolInRoute = {
  type: 'v2-pool'
  tokenIn: TokenInRoute
  tokenOut: TokenInRoute
  reserve0: V2Reserve
  reserve1: V2Reserve
  amountIn?: string
  amountOut?: string

  // not used in the interface
  // avoid returning it from the client-side smart-order-router
  address?: string
}

export interface GetQuoteArgs {
  tokenInAddress: string
  tokenInChainId: ChainId
  tokenOutAddress: string
  tokenOutChainId: ChainId
  amount: string | null // passing null will initialize the client-side SOR
  routerPreference?: RouterPreference
  // tradeType: TradeType
  userAddress?: string
  recipientAddress?: string
  slippagePercentage: number
  partner?: string
}

export const INITIALIZED = 'Initialized'
export const NO_ROUTE = 'No Route'

export type GetQuoteResult = QuoteResult | typeof INITIALIZED | typeof NO_ROUTE

/**
 * @deprecated
 */
export class InterfaceTrade extends Trade<Currency, Currency, TradeType> {}

export interface WidoTradeType<TradeInput extends Currency, TradeOutput extends Currency> {
  inputAmount: CurrencyAmount<TradeInput>
  inputAmountUsdValue?: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<TradeOutput>
  outputAmountUsdValue?: CurrencyAmount<Currency>
  executionPrice: Price<TradeInput, TradeOutput>
  fromToken: Currency
  toToken: Currency
  tx?: {
    from: Required<QuoteResult>['from']
    to: Required<QuoteResult>['to']
    data: Required<QuoteResult>['data']
    value: BigNumber
  }
  tradeType: TradeType
  steps: Step[]
}

export type WidoTrade = WidoTradeType<Currency, Currency>
