import type { Web3Provider } from '@ethersproject/providers'
import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { getPriorityConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Connector, Web3ReactStore } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'

export type Web3Connector = [Connector, Web3ReactHooks]

export function toWeb3Connector<T extends Connector>([connector, hooks]: [T, Web3ReactHooks, Web3ReactStore]): [
  T,
  Web3ReactHooks
] {
  return [connector, hooks]
}

export const metaMaskConnector = toWeb3Connector(initializeConnector<MetaMask>((actions) => new MetaMask(actions)))

export function getWalletConnectConnector(jsonRpcEndpoint?: string | JsonRpcProvider) {
  // if (jsonRpcEndpoint) {
  let rpcUrl: string
  if (JsonRpcProvider.isProvider(jsonRpcEndpoint)) {
    rpcUrl = jsonRpcEndpoint.connection.url
  } else {
    rpcUrl = jsonRpcEndpoint || 'http://localhost:8545'
  }

  return toWeb3Connector(
    initializeConnector<WalletConnect>(
      (actions) =>
        new WalletConnect(
          actions,
          {
            rpc: { 1: rpcUrl }, //todo: wc only works on network chainid 1?
          },
          false
        )
    )
  )
  // }
  // fixme: if jsonRPCendpoint not provided, WC cannot be initialized.
}

export const connectors = [metaMaskConnector, getWalletConnectConnector()]

export function useActiveProvider(): Web3Provider | undefined {
  return getPriorityConnector(...connectors).usePriorityProvider() as Web3Provider
}
