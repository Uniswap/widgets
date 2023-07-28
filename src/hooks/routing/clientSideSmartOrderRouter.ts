import { BaseProvider } from '@ethersproject/providers'
import { BigintIsh, ChainId, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import type { AlphaRouterConfig } from '@uniswap/smart-order-router'
// This file is lazy-loaded, so the import of smart-order-router is intentional.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {
  AlphaRouter,
  OnChainQuoteProvider,
  routeAmountsToString,
  StaticV2SubgraphProvider,
  UniswapMulticallProvider,
} from '@uniswap/smart-order-router'
import { nativeOnChain } from 'constants/tokens'
import JSBI from 'jsbi'
import { GetQuoteArgs, QuoteResult, QuoteState } from 'state/routing/types'
import { isExactInput } from 'utils/tradeType'

import { transformSwapRouteToGetQuoteResult } from './transformSwapRouteToGetQuoteResult'
import { SwapRouterNativeAssets } from './types'

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
  // TODO(zzmp): Upstream to @uniswap/smart-order-router, exporting an enum of supported v2 chains for clarity.
  let v2SubgraphProvider
  if (chainId !== ChainId.MAINNET) {
    v2SubgraphProvider = new StaticV2SubgraphProvider(chainId)
  }

  // V3 computes on-chain, so the quoter must have gas limits appropriate to the provider.
  // Most defaults are fine, but polygon needs a lower gas limit.
  // TODO(zzmp): Upstream to @uniswap/smart-order-router, possibly making this easier to modify
  // (eg allowing configuration without an instance to avoid duplicating multicall2Provider).
  let onChainQuoteProvider
  let multicall2Provider
  if ([ChainId.POLYGON, ChainId.POLYGON_MUMBAI].includes(chainId)) {
    multicall2Provider = new UniswapMulticallProvider(chainId, provider, 375_000)
    // See https://github.com/Uniswap/smart-order-router/blob/98c58bdee9981fd9ffac9e7d7a97b18302d5f77a/src/routers/alpha-router/alpha-router.ts#L464-L487
    onChainQuoteProvider = new OnChainQuoteProvider(
      chainId,
      provider,
      multicall2Provider,
      {
        retries: 2,
        minTimeout: 100,
        maxTimeout: 1000,
      },
      {
        multicallChunk: 10,
        gasLimitPerCall: 5_000_000,
        quoteMinSuccessRate: 0.1,
      },
      {
        gasLimitOverride: 5_000_000,
        multicallChunk: 5,
      },
      {
        gasLimitOverride: 6_250_000,
        multicallChunk: 4,
      }
    )
  }

  const router = new AlphaRouter({ chainId, provider, v2SubgraphProvider, multicall2Provider, onChainQuoteProvider })
  routers[chainId] = router
  routersCache.set(provider, routers)
  return router
}

async function getQuoteResult(
  {
    tradeType,
    tokenIn,
    tokenOut,
    amount: amountRaw,
  }: {
    tradeType: TradeType
    tokenIn: { address: string; chainId: number; decimals: number; symbol?: string }
    tokenOut: { address: string; chainId: number; decimals: number; symbol?: string }
    amount: BigintIsh | null
  },
  router: AlphaRouter,
  routerConfig: Partial<AlphaRouterConfig>
): Promise<QuoteResult> {
  const tokenInIsNative = Object.values(SwapRouterNativeAssets).includes(tokenIn.address as SwapRouterNativeAssets)
  const tokenOutIsNative = Object.values(SwapRouterNativeAssets).includes(tokenOut.address as SwapRouterNativeAssets)
  const currencyIn = tokenInIsNative
    ? nativeOnChain(tokenIn.chainId)
    : new Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals, tokenIn.symbol)
  const currencyOut = tokenOutIsNative
    ? nativeOnChain(tokenOut.chainId)
    : new Token(tokenOut.chainId, tokenOut.address, tokenOut.decimals, tokenOut.symbol)

  const baseCurrency = isExactInput(tradeType) ? currencyIn : currencyOut
  const quoteCurrency = isExactInput(tradeType) ? currencyOut : currencyIn
  const amount = CurrencyAmount.fromRawAmount(baseCurrency, JSBI.BigInt(amountRaw ?? '1')) // a null amountRaw should initialize the route
  const route = await router.route(amount, quoteCurrency, tradeType, /*swapConfig=*/ undefined, routerConfig)

  if (!amountRaw) return { state: QuoteState.INITIALIZED }
  if (!route) return { state: QuoteState.NOT_FOUND }

  return transformSwapRouteToGetQuoteResult({ ...route, routeString: routeAmountsToString(route.route) })
}

export async function getClientSideQuoteResult(
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
  return getQuoteResult(
    {
      tradeType,
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
