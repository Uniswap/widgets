import defaultTokenList from '@uniswap/default-token-list'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'

export type AddressChainToUriMap = Readonly<{ [id: string]: string }>
const AddressChainToUriMapContext = createContext<AddressChainToUriMap | null>(null)

const ListContext = createContext<TokenList[] | null>(null)

interface TokenLogoProviderProps {
  tokenListUrls?: string[]
  tokens: TokenInfo[]
}

// export function Provider2({ tokenListUrls, children }: PropsWithChildren<TokenLogoProviderProps>) {
//   const tokenLists = useContext(ListContext)

//   useEffect(() => {}, [])

//   const value = useMemo(() => {
//     return toDefaultTheme({
//       ...contextTheme,
//       ...theme,
//     } as Required<Theme>)
//   }, [contextTheme, theme])
//   return (
//     <ThemeContext.Provider value={value}>
//       <StyledProvider theme={value}>{children}</StyledProvider>
//     </ThemeContext.Provider>
//   )
// }

export function Provider({ list = [defaultTokenList], children }: PropsWithChildren<TokenLogoProviderProps>) {
  const [addressChainToUriMapContext, setAddressChainToUriMapContext] = useState<AddressChainToUriMap>()

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

  return <ChainTokenMapContext.Provider value={chainTokenMap}>{children}</ChainTokenMapContext.Provider>
}

export function useTokenLogoContext() {
  return useContext(ListContext)
}
