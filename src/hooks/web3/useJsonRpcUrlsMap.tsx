import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { ChainId } from '@uniswap/sdk-core'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

export type JsonRpcConnectionMap = { [chainId: number]: string | string[] | JsonRpcProvider | JsonRpcProvider[] }

const JsonRpcUrlMapContext = createContext<JsonRpcConnectionMap | undefined>(undefined)

export function Provider({ jsonRpcMap, children }: PropsWithChildren<{ jsonRpcMap?: JsonRpcConnectionMap }>) {
  return <JsonRpcUrlMapContext.Provider value={jsonRpcMap}>{children}</JsonRpcUrlMapContext.Provider>
}

export default function useJsonRpcUrlsMap(): Record<ChainId, string[]> {
  const jsonRpcMap = useContext(JsonRpcUrlMapContext)
  return useMemo(() => toJsonRpcUrlsMap(jsonRpcMap), [jsonRpcMap])
}

function toJsonRpcMap<T>(getChainConnections: (chainId: ChainId) => T): Record<ChainId, T> {
  return {
    [ChainId.MAINNET]: getChainConnections(ChainId.MAINNET),
    [ChainId.GOERLI]: getChainConnections(ChainId.GOERLI),
    [ChainId.SEPOLIA]: getChainConnections(ChainId.SEPOLIA),
    [ChainId.POLYGON]: getChainConnections(ChainId.POLYGON),
    [ChainId.POLYGON_MUMBAI]: getChainConnections(ChainId.POLYGON_MUMBAI),
    [ChainId.ARBITRUM_ONE]: getChainConnections(ChainId.ARBITRUM_ONE),
    [ChainId.ARBITRUM_GOERLI]: getChainConnections(ChainId.ARBITRUM_GOERLI),
    [ChainId.OPTIMISM]: getChainConnections(ChainId.OPTIMISM),
    [ChainId.OPTIMISM_GOERLI]: getChainConnections(ChainId.OPTIMISM_GOERLI),
    [ChainId.CELO]: getChainConnections(ChainId.CELO),
    [ChainId.CELO_ALFAJORES]: getChainConnections(ChainId.CELO_ALFAJORES),
    [ChainId.BNB]: getChainConnections(ChainId.BNB),
    [ChainId.GNOSIS]: getChainConnections(ChainId.GNOSIS),
    [ChainId.MOONBEAM]: getChainConnections(ChainId.MOONBEAM),
    [ChainId.AVALANCHE]: getChainConnections(ChainId.AVALANCHE),
    [ChainId.BASE]: getChainConnections(ChainId.BASE),
    [ChainId.BASE_GOERLI]: getChainConnections(ChainId.BASE_GOERLI),
  }
}

function getChainConnections(
  connectionMap: JsonRpcConnectionMap | undefined,
  chainId: ChainId
): (string | JsonRpcProvider)[] {
  const value = connectionMap?.[chainId]
  return (Array.isArray(value) ? value : [value])
    .filter((value): value is string | JsonRpcProvider => Boolean(value))
    .concat(...JSON_RPC_FALLBACK_ENDPOINTS[chainId])
}

export function toJsonRpcConnectionMap(connectionMap?: JsonRpcConnectionMap): Record<ChainId, JsonRpcProvider> {
  function getJsonRpcProvider(chainId: ChainId): JsonRpcProvider {
    const [connection] = getChainConnections(connectionMap, chainId)
    return JsonRpcProvider.isProvider(connection) ? connection : new StaticJsonRpcProvider(connection, Number(chainId))
  }
  return toJsonRpcMap(getJsonRpcProvider)
}

export function toJsonRpcUrlMap(connectionMap?: JsonRpcConnectionMap): Record<ChainId, string> {
  function getJsonRpcUrl(chainId: ChainId): string {
    const [connection] = getChainConnections(connectionMap, chainId)
    return JsonRpcProvider.isProvider(connection) ? connection.connection.url : connection
  }
  return toJsonRpcMap(getJsonRpcUrl)
}

export function toJsonRpcUrlsMap(connectionMap?: JsonRpcConnectionMap): Record<ChainId, string[]> {
  function getJsonRpcUrls(chainId: ChainId): string[] {
    const connections = getChainConnections(connectionMap, chainId)
    return connections.map((connection) =>
      JsonRpcProvider.isProvider(connection) ? connection.connection.url : connection
    )
  }
  return toJsonRpcMap(getJsonRpcUrls)
}
