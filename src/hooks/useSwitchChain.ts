import type { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { Network } from '@web3-react/network'
import { ProviderRpcError } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { ErrorCode } from 'constants/eip1193'
import useJsonRpcUrlMap from 'hooks/web3/useJsonRpcUrlMap'
import { useCallback } from 'react'
import invariant from 'tiny-invariant'

async function switchChain(provider: Web3Provider, chainIdDecimal: SupportedChainId, rpcUrls: string[]): Promise<void> {
  const { label: chainName, nativeCurrency, explorer } = getChainInfo(chainIdDecimal)
  const chainId = `0x${chainIdDecimal.toString(16)}`

  try {
    // EIP-3326 (used by MetaMask)
    await provider.send('wallet_switchEthereumChain', [{ chainId }]).catch(async (error: ProviderRpcError) => {
      if (error.code !== ErrorCode.CHAIN_NOT_ADDED) throw error
      await addChain(rpcUrls)
      await provider.send('wallet_switchEthereumChain', [{ chainId }])

      async function addChain(rpcUrls: string[]) {
        const addChainParameter = {
          chainId,
          chainName,
          rpcUrls: [rpcUrls[0]],
          nativeCurrency,
          blockExplorerUrls: [explorer],
        }
        try {
          // EIP-3085
          await provider.send('wallet_addEthereumChain', [addChainParameter])
        } catch (error) {
          // Some providers (eg MetaMask) make test calls from a background page before switching,
          // so fallback urls which are publicly available must be used. Otherwise, the switch will fail
          // if the background page origin is blocked.
          if (error?.code !== ErrorCode.USER_REJECTED_REQUEST && rpcUrls.length > 1) {
            await addChain(rpcUrls.slice(1))
          }
        }
      }
    })
  } catch (error) {
    if (error?.code !== ErrorCode.USER_REJECTED_REQUEST) {
      throw new Error(`Failed to switch network: ${error}`)
    }
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
