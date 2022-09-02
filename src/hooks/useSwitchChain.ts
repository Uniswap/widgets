import { useWeb3React } from '@web3-react/core'
import { Network } from '@web3-react/network'
import { AddEthereumChainParameter, Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { ErrorCode } from 'constants/eip1193'
import useJsonRpcUrls from 'hooks/useJsonRpcUrlMap'
import { useCallback } from 'react'

async function switchChain(connector: Connector, chainId: SupportedChainId, rpcUrls: string[]): Promise<void> {
  if (connector instanceof WalletConnect || connector instanceof Network) {
    await connector.activate(chainId)
  } else {
    const { label: chainName, nativeCurrency, explorer } = getChainInfo(chainId)
    try {
      const addChainParameter: AddEthereumChainParameter = {
        chainId,
        chainName,
        rpcUrls,
        nativeCurrency,
        blockExplorerUrls: [explorer],
      }
      await connector.activate(addChainParameter)
    } catch (error) {
      // Some providers (eg MetaMask) make test calls from a background page before switching,
      // so fallback urls which are publicly available must be used. Otherwise, the switch will fail
      // if the background page origin is blocked.
      if (error?.code !== ErrorCode.USER_REJECTED_REQUEST && rpcUrls.length > 1) {
        await switchChain(connector, chainId, rpcUrls.slice(1))
      }
    }
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
