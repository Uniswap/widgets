import { BaseProvider } from '@ethersproject/providers'
import { Trade } from '@uniswap/router-sdk'
import { Currency, Token, TradeType } from '@uniswap/sdk-core'
import type { ChainId } from '@uniswap/smart-order-router'
import { RouterPreference } from 'hooks/routing/types'

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
  tokenInDecimals: number
  tokenInSymbol?: string
  tokenOutAddress: string
  tokenOutChainId: ChainId
  tokenOutDecimals: number
  tokenOutSymbol?: string
  amount: string | null // passing null will initialize the client-side SOR
  routerPreference?: RouterPreference
  routerUrl?: string
  tradeType: TradeType
  provider: BaseProvider
}

export interface QuoteResult {
  quoteId?: string
  blockNumber: string
  amount: string
  amountDecimals: string
  gasPriceWei: string
  gasUseEstimate: string
  gasUseEstimateQuote: string
  gasUseEstimateQuoteDecimals: string
  gasUseEstimateUSD: string
  methodParameters?: { calldata: string; value: string }
  quote: string
  quoteDecimals: string
  quoteGasAdjusted: string
  quoteGasAdjustedDecimals: string
  route: Array<(V3PoolInRoute | V2PoolInRoute)[]>
  routeString: string
}

export const INITIALIZED = 'Initialized'
export const NO_ROUTE = 'No Route'

export type GetQuoteError = typeof INITIALIZED | typeof NO_ROUTE

export type TradeResult = {
  trade?: InterfaceTrade
  gasUseEstimateUSD?: string
  blockNumber: string
}

export type TradeQuoteResult = TradeResult | GetQuoteError

export class InterfaceTrade extends Trade<Currency, Currency, TradeType> {}
