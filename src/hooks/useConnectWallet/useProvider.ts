import type { Web3Provider } from '@ethersproject/providers'
import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { getPriorityConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Connector, Web3ReactStore } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { Buffer } from 'buffer'
import { FALLBACK_JSON_RPC_URL, getNetwork, Web3ContextType } from 'hooks/useActiveWeb3React'
import { useCallback } from 'react'

export type Web3Connector = [Connector, Web3ReactHooks]

export function toWeb3Connector<T extends Connector>([connector, hooks]: [T, Web3ReactHooks, Web3ReactStore]): [
  T,
  Web3ReactHooks
] {
  return [connector, hooks]
}

export const metaMaskConnector = toWeb3Connector(initializeConnector<MetaMask>((actions) => new MetaMask(actions)))

export function getWalletConnectConnector(jsonRpcEndpoint?: string | JsonRpcProvider) {
  // WalletConnect relies on Buffer, so it must be polyfilled.
  if (!('Buffer' in window)) {
    window.Buffer = Buffer
  }

  let rpcUrl: string
  if (JsonRpcProvider.isProvider(jsonRpcEndpoint)) {
    rpcUrl = jsonRpcEndpoint.connection.url
  } else {
    rpcUrl = jsonRpcEndpoint ?? FALLBACK_JSON_RPC_URL
  }

  return toWeb3Connector(
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

export const connectors = [metaMaskConnector, getWalletConnectConnector()]

export function useActiveProvider(): Web3Provider | undefined {
  const activeWalletProvider = getPriorityConnector(...connectors).usePriorityProvider() as Web3Provider
  const { connector: network } = getNetwork() // Return network-only provider if no wallet is connected
  return activeWalletProvider ?? network.provider
}

export function useConnect(connector: Web3Connector, context: Web3ContextType) {
  const [wallet, hooks] = connector
  const isActive = hooks.useIsActive()
  const accounts = hooks.useAccounts()
  const account = hooks.useAccount()
  const activating = hooks.useIsActivating()
  const active = hooks.useIsActive()
  const chainId = hooks.useChainId()
  const error = hooks.useError()
  const library = hooks.useProvider()

  const useWallet = useCallback(() => {
    // TODO(kristiehuang): if user is already connected to the page, it should auto-connect.. why is isActive false on startup?
    if (!isActive) {
      console.log('wallet is inactive, activating now', wallet)
      connectors.forEach(([wallet, _]) => wallet.deactivate())
      wallet.activate()
    } else {
      console.log('wallet should be already be active')
      context.accounts = accounts
      context.account = account
      context.activating = activating
      context.active = active
      context.chainId = chainId
      context.error = error
      context.library = library
    }
  }, [account, accounts, activating, active, chainId, context, error, isActive, library, wallet])

  return useWallet
}
