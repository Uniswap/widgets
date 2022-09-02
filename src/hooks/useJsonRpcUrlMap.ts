import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'

export type JsonRpcUrlMap = { [chainId: number]: string | string[] }

const jsonRpcUrlMapAtom = atom<Record<SupportedChainId, string[]>>(JSON_RPC_FALLBACK_ENDPOINTS)

export default function useJsonRpcUrlMap(): [
  Record<SupportedChainId, string[]>,
  (jsonRpcUrlMap?: JsonRpcUrlMap) => void
] {
  const [jsonRpcUrlMap, setJsonRpcUrlMap] = useAtom(jsonRpcUrlMapAtom)
  const setJsonRpcUrlMapWithFallbacks = useCallback(
    (jsonRpcUrlMap?: JsonRpcUrlMap) => {
      if (!jsonRpcUrlMap) {
        setJsonRpcUrlMap(JSON_RPC_FALLBACK_ENDPOINTS)
        return
      }

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
      setJsonRpcUrlMap(jsonRpcUrlMapWithFallbacks)
    },
    [setJsonRpcUrlMap]
  )
  return [jsonRpcUrlMap, setJsonRpcUrlMapWithFallbacks]
}
