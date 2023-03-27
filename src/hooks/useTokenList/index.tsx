import { TokenInfo } from '@uniswap/token-lists'
import { useAsyncError } from 'components/Error/ErrorBoundary'
import { SupportedChainId, VISIBLE_CHAIN_IDS } from 'constants/chains'
import { useEvmChainId, useEvmProvider, widgetSettingsAtom } from 'hooks/useSyncWidgetSettings'
import { useAtomValue } from 'jotai/utils'
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import resolveENSContentHash from 'utils/resolveENSContentHash'
import { getSupportedTokens, Token } from 'wido'

import { ChainTokenMap, TokenListItem, tokensToChainTokenMap } from './utils'

export { useQueryTokens } from './useQueryTokens'

export const EMPTY_TOKEN_LIST = []

const MISSING_PROVIDER = Symbol()
const ChainTokenMapContext = createContext<ChainTokenMap | typeof MISSING_PROVIDER>(MISSING_PROVIDER)

export function useChainTokenMapContext() {
  const chainTokenMap = useContext(ChainTokenMapContext)
  if (chainTokenMap === MISSING_PROVIDER) {
    throw new Error('TokenList hooks must be wrapped in a <TokenListProvider>')
  }
  return chainTokenMap || {}
}

export function useIsTokenListLoaded() {
  return Boolean(useChainTokenMapContext())
}

export default function useTokenList(): TokenListItem[] {
  const chainTokenMap = useChainTokenMapContext()
  return useMemo(() => {
    if (!chainTokenMap) return []
    const tokens: TokenListItem[] = []
    const tokenMaps = Object.values(chainTokenMap)
    tokenMaps.forEach((tokenMap) => {
      tokens.push(...Object.values(tokenMap).map(({ token }) => token))
    })
    return tokens
  }, [chainTokenMap])
}

export type TokenMap = { [address: string]: TokenListItem }

export function useTokenMap(chainId?: SupportedChainId): TokenMap {
  const activeChainId = useEvmChainId()

  chainId = chainId || activeChainId

  const chainTokenMap = useChainTokenMapContext()
  const tokenMap = chainId && chainTokenMap?.[chainId]
  return useMemo(() => {
    if (!tokenMap) return {}
    return Object.entries(tokenMap).reduce((map, [address, { token }]) => {
      map[address] = token
      return map
    }, {} as TokenMap)
  }, [tokenMap])
}

export function TestableProvider({ list, children }: PropsWithChildren<{ list: Token[] }>) {
  const chainTokenMap = useMemo(() => tokensToChainTokenMap(list), [list])
  return <ChainTokenMapContext.Provider value={chainTokenMap}>{children}</ChainTokenMapContext.Provider>
}

export function Provider({ list, children }: PropsWithChildren<{ list?: string | TokenInfo[] }>) {
  const [chainTokenMap, setChainTokenMap] = useState<ChainTokenMap>({})
  useEffect(() => setChainTokenMap({}), [list])

  const chainId = useEvmChainId()
  const provider = useEvmProvider()
  const resolver = useCallback(
    (ensName: string) => {
      if (provider && chainId === 1) {
        return resolveENSContentHash(ensName, provider)
      }
      throw new Error('Could not construct mainnet ENS resolver')
    },
    [chainId, provider]
  )

  const throwError = useAsyncError()
  useEffect(() => {
    // If the list was already loaded, don't reload it.
    if (chainTokenMap && Object.keys(chainTokenMap).length > 0) return

    let stale = false
    activateList()
    return () => {
      stale = true
    }

    async function activateList() {
      try {
        const tokens = await getSupportedTokens()
        // tokensToChainTokenMap also caches the fetched tokens, so it must be invoked even if stale.
        const map = tokensToChainTokenMap(tokens)
        if (!stale) {
          setChainTokenMap(map)
        }
      } catch (e: unknown) {
        if (!stale) {
          // Do not update the token map, in case the map was already resolved without error on mainnet.
          throwError(e as Error)
        }
      }
    }
  }, [chainTokenMap, list, resolver, throwError])

  return <ChainTokenMapContext.Provider value={chainTokenMap}>{children}</ChainTokenMapContext.Provider>
}

export function useWidgetFromTokens(): TokenListItem[] {
  const allTokens = useTokenList()

  const chainTokenMap = useChainTokenMapContext()
  const presetTokens = useAtomValue(widgetSettingsAtom)
    .fromTokens?.map((token) => chainTokenMap[token.chainId]?.[token.address]?.token)
    .filter((token) => !!token)
  if (presetTokens) return presetTokens

  return allTokens.filter((x) => VISIBLE_CHAIN_IDS.includes(x.chainId))
}

export function useWidgetToTokens(): TokenListItem[] {
  const allTokens = useTokenList()

  const chainTokenMap = useChainTokenMapContext()
  const presetTokens = useAtomValue(widgetSettingsAtom)
    .toTokens?.map((token) => chainTokenMap[token.chainId]?.[token.address]?.token)
    .filter((token) => !!token)

  if (presetTokens) return presetTokens

  return allTokens.filter((x) => VISIBLE_CHAIN_IDS.includes(x.chainId))
}
