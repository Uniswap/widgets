import { useWeb3React } from '@web3-react/core'
import { Network } from '@web3-react/network'
import { AddEthereumChainParameter, Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import { useCallback } from 'react'

async function switchChain(connector: Connector, chainId: SupportedChainId): Promise<void> {
  if (connector instanceof WalletConnect || connector instanceof Network) {
    await connector.activate(chainId)
  } else {
    // Some providers (eg MetaMask) make test calls from a background page before switching chains,
    // so fallback endpoints which are publicly available must be provided.
    // Otherwise, the chain switch will fail if the background page origin is blocked.
    const rpcUrls = /* TODO(zzmp): Try user-supplied url */ JSON_RPC_FALLBACK_ENDPOINTS[chainId]

    const { label: chainName, nativeCurrency, explorer } = getChainInfo(chainId)
    const addChainParameter: AddEthereumChainParameter = {
      chainId,
      chainName,
      rpcUrls,
      nativeCurrency,
      blockExplorerUrls: [explorer],
    }
    await connector.activate(addChainParameter)
  }
}

export default function useSwitchChain(): (chainId: SupportedChainId) => Promise<void> {
  const { connector } = useWeb3React()
  return useCallback((chainId: SupportedChainId) => switchChain(connector, chainId), [connector])
}
