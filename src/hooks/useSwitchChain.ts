import type { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { ErrorCode } from 'constants/eip1193'
import useJsonRpcUrlsMap from 'hooks/web3/useJsonRpcUrlsMap'
import { useCallback } from 'react'

function toHex(chainId: SupportedChainId): string {
  return `0x${chainId.toString(16)}`
}

async function addChain(provider: Web3Provider, chainId: SupportedChainId, rpcUrls: string[]): Promise<void> {
  const { label: chainName, nativeCurrency, explorer } = getChainInfo(chainId)
  const addChainParameter = {
    chainId: toHex(chainId),
    chainName,
    nativeCurrency,
    blockExplorerUrls: [explorer],
  }

  for (const rpcUrl of rpcUrls) {
    try {
      await provider.send('wallet_addEthereumChain', [{ ...addChainParameter, rpcUrls: [rpcUrl] }]) // EIP-3085
    } catch (error) {
      // Some providers (eg MetaMask) make test calls from a background page before switching,
      // so fallback urls which are publicly available must be used. Otherwise, the switch will fail
      // if the background page origin is blocked.
      if (error?.code !== ErrorCode.USER_REJECTED_REQUEST) continue
      throw error
    }
  }
}

async function switchChain(provider: Web3Provider, chainId: SupportedChainId, rpcUrls: string[] = []): Promise<void> {
  try {
    await provider.send('wallet_switchEthereumChain', [{ chainId: toHex(chainId) }]) // EIP-3326 (used by MetaMask)
  } catch (error) {
    if (error?.code === ErrorCode.CHAIN_NOT_ADDED && rpcUrls.length) {
      await addChain(provider, chainId, rpcUrls)
      return switchChain(provider, chainId)
    }
    throw error
  }
}

export default function useSwitchChain(): (chainId: SupportedChainId) => Promise<void> {
  const { connector, provider } = useWeb3React()
  const urlMap = useJsonRpcUrlsMap()
  return useCallback(
    async (chainId: SupportedChainId) => {
      try {
        try {
          // A custom Connector may use a customProvider, in which case it should handle its own chain switching.
          if (!provider) throw new Error()

          await Promise.all([
            // Await both the user action (switchChain) and its result (chainChanged)
            // so that the callback does not resolve before the chain switch has visibly occured.
            new Promise((resolve) => provider.once('chainChanged', resolve)),
            switchChain(provider, chainId, urlMap[chainId]),
          ])
        } catch (error) {
          if (error?.code === ErrorCode.USER_REJECTED_REQUEST) return
          await connector.activate(chainId)
        }
      } catch (error) {
        throw new Error(`Failed to switch network: ${error}`)
      }
    },
    [connector, provider, urlMap]
  )
}
