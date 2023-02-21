import { Token } from '@uniswap/sdk-core'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { useWeb3React } from '@web3-react/core'
import { useAsyncError } from 'components/Error/ErrorBoundary'
import { SupportedChainId } from 'constants/chains'
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import resolveENSContentHash from 'utils/resolveENSContentHash'

import { LogoUpdater } from '../../components/Logo/'
import fetchTokenList from './fetchTokenList'
import { ChainTokenMap, tokensToChainTokenMap } from './utils'
import { validateTokens } from './validateTokenList'

export { useQueryTokens } from './useQueryTokens'

export const UNISWAP_TOKEN_LIST = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'
export const EMPTY_TOKEN_LIST = []

const MISSING_PROVIDER = Symbol()
const ChainTokenMapContext = createContext<ChainTokenMap | undefined | typeof MISSING_PROVIDER>(MISSING_PROVIDER)

function useChainTokenMapContext() {
  const chainTokenMap = useContext(ChainTokenMapContext)
  if (chainTokenMap === MISSING_PROVIDER) {
    throw new Error('TokenList hooks must be wrapped in a <TokenListProvider>')
  }
  return chainTokenMap
}

export function useIsTokenListLoaded() {
  return Boolean(useChainTokenMapContext())
}

export default function useTokenList(): WrappedTokenInfo[] {
  const { chainId } = useWeb3React()
  const chainTokenMap = useChainTokenMapContext()
  const tokenMap = chainId && chainTokenMap?.[chainId]
  return useMemo(() => {
    if (!tokenMap) return []
    return Object.values(tokenMap).map(({ token }) => token)
  }, [tokenMap])
}

export type TokenMap = { [address: string]: Token }

export function useTokenMap(chainId?: SupportedChainId): TokenMap {
  const { chainId: activeChainId } = useWeb3React()

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

export function TestableProvider({ list, children }: PropsWithChildren<{ list: TokenInfo[] }>) {
  const chainTokenMap = useMemo(() => tokensToChainTokenMap(list), [list])
  return <ChainTokenMapContext.Provider value={chainTokenMap}>{children}</ChainTokenMapContext.Provider>
}

export function Provider({ list = UNISWAP_TOKEN_LIST, children }: PropsWithChildren<{ list?: string | TokenInfo[] }>) {
  const [chainTokenMap, setChainTokenMap] = useState<ChainTokenMap>()

  useEffect(() => setChainTokenMap(undefined), [list])

  const { chainId, provider } = useWeb3React()
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
    if (chainTokenMap) return

    let stale = false
    activateList(list)
    return () => {
      stale = true
    }

    async function activateList(list: string | TokenInfo[]) {
      try {
        let tokens: TokenList | TokenInfo[]
        if (typeof list === 'string') {
          tokens = await fetchTokenList(list, resolver)
        } else {
          // Empty lists will fail validation, but are valid (eg EMPTY_TOKEN_LIST)
          // for integrators using their own token selection UI.
          tokens = list.length > 0 ? await validateTokens(list) : EMPTY_TOKEN_LIST
        }
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

  return (
    <ChainTokenMapContext.Provider value={chainTokenMap}>
      <TokenListLogoUpdater />
      {children}
    </ChainTokenMapContext.Provider>
  )
}

function TokenListLogoUpdater() {
  return <LogoUpdater assets={useTokenList()} />
}
