import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import { createContext, useContext } from 'react'
import invariant from 'tiny-invariant'

export type JsonRpcUrlMap = { [chainId: number]: string | string[] }

export function toJsonRpcUrlMap(jsonRpcUrlMap?: JsonRpcUrlMap): Record<SupportedChainId, string[]> {
  if (!jsonRpcUrlMap) return JSON_RPC_FALLBACK_ENDPOINTS

  const jsonRpcUrlMapWithFallbacks: Record<SupportedChainId, string[]> = ALL_SUPPORTED_CHAIN_IDS.reduce(
    (map, chainId) => {
      const value = jsonRpcUrlMap[chainId]
      const urls = (Array.isArray(value) ? value : [value]).filter(Boolean)
      const fallbackUrls = JSON_RPC_FALLBACK_ENDPOINTS[chainId]
      map[chainId] = [...urls, ...fallbackUrls]
      return map
    },
    {} as Record<SupportedChainId, string[]>
  )
  return jsonRpcUrlMapWithFallbacks
}

const JsonRpcUrlMapContext = createContext<Record<SupportedChainId, string[]> | null>(null)

export const Provider = JsonRpcUrlMapContext.Provider

export default function useJsonRpcUrlMap(): Record<SupportedChainId, string[]> {
  const jsonRpcUrlMap = useContext(JsonRpcUrlMapContext)
  invariant(jsonRpcUrlMap, 'useJsonRpcUrlMap used without initializing the context')
  return jsonRpcUrlMap
}
