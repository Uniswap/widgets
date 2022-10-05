import { BaseProvider } from '@ethersproject/providers'
import { BigintIsh, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import type { AlphaRouterConfig } from '@uniswap/smart-order-router'
// This file is lazy-loaded, so the import of smart-order-router is intentional.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { AlphaRouter, ChainId, routeAmountsToString, StaticV2SubgraphProvider } from '@uniswap/smart-order-router'
import JSBI from 'jsbi'
import { GetQuoteArgs, GetQuoteResult } from 'state/routing/types'
import { isExactInput } from 'utils/tradeType'

import { transformSwapRouteToGetQuoteResult } from './transformSwapRouteToGetQuoteResult'

const AUTO_ROUTER_SUPPORTED_CHAINS: ChainId[] = Object.values(ChainId).filter((chainId): chainId is ChainId =>
  Number.isInteger(chainId)
)

function isAutoRouterSupportedChain(chainId: ChainId | undefined): boolean {
  return Boolean(chainId && AUTO_ROUTER_SUPPORTED_CHAINS.includes(chainId))
}

/** A cache of AlphaRouters, which must be initialized to a specific chain/provider. */
const routersCache = new WeakMap<BaseProvider, { [chainId: number]: AlphaRouter }>()

function getRouter(chainId: ChainId, provider: BaseProvider): AlphaRouter {
  const routers = routersCache.get(provider) || {}
  const cached = routers[chainId]
  if (cached) return cached

  // V2 is unsupported for chains other than mainnet.
  // TODO(zzmp): Upstream to @uniswap/smart-order-router.
  let v2SubgraphProvider
  if (chainId !== ChainId.MAINNET) {
    v2SubgraphProvider = new StaticV2SubgraphProvider(chainId)
  }

  const router = new AlphaRouter({ chainId, provider, v2SubgraphProvider })
  routers[chainId] = router
  routersCache.set(provider, routers)
  return router
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
  router: AlphaRouter,
  routerConfig: Partial<AlphaRouterConfig>
): Promise<{ data: GetQuoteResult }> {
  const currencyIn = new Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals, tokenIn.symbol)
  const currencyOut = new Token(tokenOut.chainId, tokenOut.address, tokenOut.decimals, tokenOut.symbol)

  const baseCurrency = isExactInput(tradeType) ? currencyIn : currencyOut
  const quoteCurrency = isExactInput(tradeType) ? currencyOut : currencyIn
  const amount = CurrencyAmount.fromRawAmount(baseCurrency, JSBI.BigInt(amountRaw))
  const route = await router.route(amount, quoteCurrency, tradeType, /*swapConfig=*/ undefined, routerConfig)

  if (!route) {
    throw new Error(`Failed to generate client side quote from ${currencyIn.symbol} to ${currencyOut.symbol}`)
  }

  return {
    data: {
      ...transformSwapRouteToGetQuoteResult(route),
      routeString: routeAmountsToString(route.route),
    },
  }
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
    provider,
  }: GetQuoteArgs,
  routerConfig: Partial<AlphaRouterConfig>
) {
  if (!isAutoRouterSupportedChain(tokenInChainId)) {
    throw new Error(`Router does not support this token's chain (chainId: ${tokenInChainId}).`)
  }

  const router = getRouter(tokenInChainId, provider)
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
    router,
    routerConfig
  )
}
