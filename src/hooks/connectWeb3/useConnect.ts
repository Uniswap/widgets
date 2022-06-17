import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { getPriorityConnector, initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Connector, Web3ReactStore } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { Buffer } from 'buffer'
import { getNetwork, useUpdateActiveWeb3ReactCallback, Web3ContextType } from 'hooks/connectWeb3/useActiveWeb3React'
import { useCallback } from 'react'

export type Web3Connection = [Connector, Web3ReactHooks]

function toWeb3Connection<T extends Connector>([connector, hooks]: [T, Web3ReactHooks, Web3ReactStore]): [
  T,
  Web3ReactHooks
] {
  return [connector, hooks]
}

const metaMaskConnection = toWeb3Connection(initializeConnector<MetaMask>((actions) => new MetaMask(actions)))

function getWalletConnectConnection(jsonRpcEndpoint?: string | JsonRpcProvider) {
  // WalletConnect relies on Buffer, so it must be polyfilled.
  if (!('Buffer' in window)) {
    window.Buffer = Buffer
  }

  let rpcUrl: string
  if (JsonRpcProvider.isProvider(jsonRpcEndpoint)) {
    rpcUrl = jsonRpcEndpoint.connection.url
  } else {
    rpcUrl = jsonRpcEndpoint ?? '' // FIXME: use fallback RPC URL
  }

  return toWeb3Connection(
    initializeConnector<WalletConnect>(
      (actions) =>
        new WalletConnect(
          actions,
          {
            rpc: { 1: rpcUrl }, // TODO(kristiehuang): WC only works on network chainid 1?
          },
          false
        )
    )
  )
}

export const connections = [metaMaskConnection, getWalletConnectConnection()]

export function useActiveProvider(): Web3Provider | undefined {
  const activeWalletProvider = getPriorityConnector(...connections).usePriorityProvider() as Web3Provider
  const { connector: network } = getNetwork() // Return network-only provider if no wallet is connected
  return activeWalletProvider ?? network.provider
}

export default function useConnectWallet(connection: Web3Connection) {
  const [wallet, hooks] = connection
  const isActive = hooks.useIsActive()
  const accounts = hooks.useAccounts()
  const account = hooks.useAccount()
  const activating = hooks.useIsActivating()
  const chainId = hooks.useChainId()
  const error = hooks.useError()
  const library = hooks.useProvider()
  const updateActiveWeb3ReactCallback = useUpdateActiveWeb3ReactCallback()

  const useWallet = useCallback(() => {
    if (!isActive) {
      console.log('wallet is inactive, activating now', wallet)
      connections.forEach(([wallet, _]) => wallet.deactivate())
      wallet.activate()
    } else {
      console.log('wallet should be already be active')
      const updateContext: Web3ContextType = {
        connector: wallet,
        library,
        accounts,
        account,
        activating,
        activeWallet: isActive,
        chainId,
        error,
      }
      updateActiveWeb3ReactCallback(updateContext)
    }
  }, [account, accounts, activating, chainId, error, isActive, library, updateActiveWeb3ReactCallback, wallet])

  return useWallet
}
