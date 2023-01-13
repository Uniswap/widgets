import type { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { ErrorCode } from 'constants/eip1193'
import useJsonRpcUrlsMap from 'hooks/web3/useJsonRpcUrlsMap'
import { atom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'

import useConnectors from './web3/useConnectors'

/** Defined by EIP-3085. */
export interface AddEthereumChainParameter {
  chainId: string
  chainName: string
  nativeCurrency: { name: string; symbol: string; decimals: 18 }
  blockExplorerUrls: [string]
  rpcUrls: string[]
}

/**
 * An integration hook called when the user tries to switch chains.
 * If the hook returns a Promise, it is assumed the integrator is attempting to switch the chain, and no further attempts will be made.
 * If that Promise rejects, the error will be ignored so as not to crash the widget.
 */
export type OnSwitchChain = (addChainParameter: AddEthereumChainParameter) => void | Promise<void>
export const onSwitchChainAtom = atom<OnSwitchChain | undefined>(undefined)

function toHex(chainId: SupportedChainId): string {
  return `0x${chainId.toString(16)}`
}

/** Attempts to add and switch to a chain in the wallet. */
async function addChain(provider: Web3Provider, addChainParameter: AddEthereumChainParameter): Promise<void> {
  for (const rpcUrl of addChainParameter.rpcUrls) {
    try {
      // NB: MetaMask will prompt to switch to a successfully added chain as part of wallet_addEthereumChain.
      await provider.send('wallet_addEthereumChain', [{ ...addChainParameter, rpcUrls: [rpcUrl] }]) // EIP-3085
      return
    } catch (error) {
      // Some providers (eg MetaMask) make test calls from a background page before switching,
      // so fallback urls which are publicly available must be used. Otherwise, the switch will fail
      // if the background page origin is blocked.
      if (error?.code !== ErrorCode.USER_REJECTED_REQUEST) continue
      throw error
    }
  }
}

async function switchChain(
  provider: Web3Provider,
  chainId: SupportedChainId,
  addChainParameter?: AddEthereumChainParameter
): Promise<void> {
  try {
    await provider.send('wallet_switchEthereumChain', [{ chainId: toHex(chainId) }]) // EIP-3326 (used by MetaMask)
  } catch (error) {
    if (error?.code === ErrorCode.CHAIN_NOT_ADDED && addChainParameter?.rpcUrls.length) {
      return addChain(provider, addChainParameter)
    }
    throw error
  }
}

export default function useSwitchChain(): (chainId: SupportedChainId) => Promise<void> {
  const { connector, provider } = useWeb3React()
  const connectors = useConnectors()
  const urlMap = useJsonRpcUrlsMap()
  const onSwitchChain = useAtomValue(onSwitchChainAtom)
  return useCallback(
    async (chainId: SupportedChainId) => {
      const { safe, label, nativeCurrency, explorer } = getChainInfo(chainId)
      const addChainParameter: AddEthereumChainParameter = {
        chainId: toHex(chainId),
        chainName: safe?.label ?? label,
        nativeCurrency: {
          ...nativeCurrency,
          symbol: safe?.symbol ?? nativeCurrency.symbol,
        },
        blockExplorerUrls: [explorer],
        rpcUrls: urlMap[chainId],
      }
      try {
        // The network connector does not implement EIP--3326.
        if (connector === connectors.network) return await connector.activate(chainId)

        // The user connector may require custom logic: try onSwitchChain if it is available.
        if (connector === connectors.user) {
          try {
            const switching = onSwitchChain?.(addChainParameter)
            // If onSwitchChain returns a Promise, the integrator is responsible for any chain switching. Await and return.
            if (switching) return await switching
          } catch (error) {
            return // ignores integrator-originated errors
          }
        }

        try {
          // A custom Connector may use a customProvider, in which case it should handle its own chain switching.
          if (!provider) throw new Error()

          await Promise.all([
            // Await both the user action (switchChain) and its result (chainChanged)
            // so that the callback does not resolve before the chain switch has visibly occured.
            new Promise((resolve) => provider.once('chainChanged', resolve)),
            switchChain(provider, chainId, addChainParameter),
          ])
        } catch (error) {
          if (error?.code === ErrorCode.USER_REJECTED_REQUEST) return
          await connector.activate(chainId)
        }
      } catch (error) {
        throw new Error(`Failed to switch network: ${error}`)
      }
    },
    [connector, connectors.network, connectors.user, onSwitchChain, provider, urlMap]
  )
}
