import type { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { ErrorCode } from 'constants/eip1193'
import useJsonRpcUrlMap from 'hooks/web3/useJsonRpcUrlMap'
import { useCallback } from 'react'
import invariant from 'tiny-invariant'

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
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: toHex(chainId) }]) // EIP-3326 (used by MetaMask)
    } catch (error) {
      if (error?.code === ErrorCode.CHAIN_NOT_ADDED && rpcUrls.length) {
        await addChain(provider, chainId, rpcUrls)
        return switchChain(provider, chainId)
      }
      throw error
    }
  } catch (error) {
    if (error?.code === ErrorCode.USER_REJECTED_REQUEST) return
    throw new Error(`Failed to switch network: ${error}`)
  }
}

export default function useSwitchChain(): (chainId: SupportedChainId) => Promise<void> {
  const { connector, provider } = useWeb3React()
  const urlMap = useJsonRpcUrlMap()
  return useCallback(
    (chainId: SupportedChainId) => {
      if (connector instanceof WalletConnect || connector instanceof Network) {
        return connector.activate(chainId)
      }

      invariant(provider)
      return switchChain(provider, chainId, urlMap[chainId])
    },
    [connector, provider, urlMap]
  )
}
