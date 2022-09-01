import { useWeb3React } from '@web3-react/core'
import { Network } from '@web3-react/network'
import { AddEthereumChainParameter, Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import useJsonRpcUrls from 'hooks/useJsonRpcUrlMap'
import { useCallback } from 'react'

async function switchChain(connector: Connector, chainId: SupportedChainId, rpcUrls: string[]): Promise<void> {
  if (connector instanceof WalletConnect || connector instanceof Network) {
    await connector.activate(chainId)
  } else {
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
  const [rpcUrls] = useJsonRpcUrls()
  return useCallback(
    (chainId: SupportedChainId) => switchChain(connector, chainId, rpcUrls[chainId]),
    [connector, rpcUrls]
  )
}
