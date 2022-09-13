import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import { createContext, useContext } from 'react'
import invariant from 'tiny-invariant'

export type JsonRpcConnectionMap = { [chainId: number]: string | string[] | JsonRpcProvider | JsonRpcProvider[] }

const JsonRpcUrlMapContext = createContext<Record<SupportedChainId, string[]> | null>(null)

export const Provider = JsonRpcUrlMapContext.Provider

export default function useJsonRpcUrlMap(): Record<SupportedChainId, string[]> {
  const jsonRpcUrlMap = useContext(JsonRpcUrlMapContext)
  invariant(jsonRpcUrlMap, 'useJsonRpcUrlMap used without initializing the context')
  return jsonRpcUrlMap
}

function toJsonRpcMap(connectionMap?: JsonRpcConnectionMap): Record<SupportedChainId, (JsonRpcProvider | string)[]> {
  return ALL_SUPPORTED_CHAIN_IDS.reduce((map, chainId) => {
    const value = connectionMap?.[chainId]
    const connections = (Array.isArray(value) ? value : [value])
      .filter((value): value is string | JsonRpcProvider => Boolean(value))
      .concat(...JSON_RPC_FALLBACK_ENDPOINTS[chainId])
    return {
      ...map,
      [chainId]: connections,
    }
  }, {} as Record<SupportedChainId, (JsonRpcProvider | string)[]>)
}

export function toJsonRpcConnectionMap(
  connectionMap?: JsonRpcConnectionMap
): Record<SupportedChainId, [JsonRpcProvider]> {
  return Object.entries(toJsonRpcMap(connectionMap)).reduce((map, [chainId, connections]) => {
    const connection = connections[0]
    const provider = JsonRpcProvider.isProvider(connection)
      ? connection
      : new StaticJsonRpcProvider(connection, chainId)
    return { ...map, [chainId]: [provider] }
  }, {} as Record<SupportedChainId, [JsonRpcProvider]>)
}

export function toJsonRpcUrlMap(connectionMap?: JsonRpcConnectionMap): Record<SupportedChainId, string[]> {
  return Object.entries(toJsonRpcMap(connectionMap)).reduce(
    (urlMap, [chainId, connections]) => ({
      ...urlMap,
      [chainId]: connections.map((value) => (JsonRpcProvider.isProvider(value) ? value.connection.url : value)),
    }),
    {} as Record<SupportedChainId, string[]>
  )
}
