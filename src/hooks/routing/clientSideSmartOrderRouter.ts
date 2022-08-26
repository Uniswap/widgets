import { JsonRpcProvider } from '@ethersproject/providers'
import { BigintIsh, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
// This file is lazy-loaded, so the import of smart-order-router is intentional.
// eslint-disable-next-line no-restricted-imports
import { AlphaRouter, AlphaRouterConfig, AlphaRouterParams, ChainId } from '@uniswap/smart-order-router'
import JSBI from 'jsbi'
import { GetQuoteResult } from 'state/routing/types'
import { isExactInput } from 'utils/tradeType'

import { transformSwapRouteToGetQuoteResult } from './transformSwapRouteToGetQuoteResult'

const AUTO_ROUTER_SUPPORTED_CHAINS: ChainId[] = Object.values(ChainId).filter((chainId): chainId is ChainId =>
  Number.isInteger(chainId)
)

export function isAutoRouterSupportedChain(chainId: ChainId | undefined): boolean {
  return Boolean(chainId && AUTO_ROUTER_SUPPORTED_CHAINS.includes(chainId))
}

async function getQuote(
  {
    tradeType,
    chainId,
    tokenIn,
    tokenOut,
    amount: amountRaw,
  }: {
    tradeType: TradeType
    chainId: ChainId
    tokenIn: { address: string; chainId: number; decimals: number; symbol?: string }
    tokenOut: { address: string; chainId: number; decimals: number; symbol?: string }
    amount: BigintIsh
  },
  provider: JsonRpcProvider,
  routerConfig: Partial<AlphaRouterConfig>
): Promise<{ data: GetQuoteResult; error?: unknown }> {
  const routerParams: AlphaRouterParams = { chainId, provider }
  const router = new AlphaRouter(routerParams)

  const currencyIn = new Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals, tokenIn.symbol)
  const currencyOut = new Token(tokenOut.chainId, tokenOut.address, tokenOut.decimals, tokenOut.symbol)

  const baseCurrency = isExactInput(tradeType) ? currencyIn : currencyOut
  const quoteCurrency = isExactInput(tradeType) ? currencyOut : currencyIn
  const amount = CurrencyAmount.fromRawAmount(baseCurrency, JSBI.BigInt(amountRaw))
  const swapRoute = await router.route(amount, quoteCurrency, tradeType, /*swapConfig=*/ undefined, routerConfig)

  if (!swapRoute)
    throw new Error(`Failed to generate client side quote from ${currencyIn.symbol} to ${currencyOut.symbol}`)

  return { data: transformSwapRouteToGetQuoteResult(tradeType, amount, swapRoute) }
}

interface QuoteArguments {
  tokenInAddress: string
  tokenInChainId: ChainId
  tokenInDecimals: number
  tokenInSymbol?: string
  tokenOutAddress: string
  tokenOutChainId: ChainId
  tokenOutDecimals: number
  tokenOutSymbol?: string
  amount: string
  tradeType: TradeType
}

export async function getClientSideQuote(
  {
    tokenInAddress,
    tokenInChainId,
    tokenInDecimals,
    tokenInSymbol,
    tokenOutAddress,
    tokenOutChainId,
    tokenOutDecimals,
    tokenOutSymbol,
    amount,
    tradeType,
  }: QuoteArguments,
  provider: JsonRpcProvider,
  routerConfig: Partial<AlphaRouterConfig>
) {
  return getQuote(
    {
      tradeType,
      chainId: tokenInChainId,
      tokenIn: {
        address: tokenInAddress,
        chainId: tokenInChainId,
        decimals: tokenInDecimals,
        symbol: tokenInSymbol,
      },
      tokenOut: {
        address: tokenOutAddress,
        chainId: tokenOutChainId,
        decimals: tokenOutDecimals,
        symbol: tokenOutSymbol,
      },
      amount,
    },
    provider,
    routerConfig
  )
}
