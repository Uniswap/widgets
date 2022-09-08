import { EIP1193 } from '@web3-react/eip1193'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import { createContext, useContext } from 'react'
import invariant from 'tiny-invariant'
import JsonRpcConnector from 'utils/JsonRpcConnector'

export interface Connectors {
  user: EIP1193 | JsonRpcConnector | undefined
  metaMask: MetaMask
  walletConnect: WalletConnect
  walletConnectQR: WalletConnect
  network: Network
}

const ConnectorsContext = createContext<Connectors | null>(null)

export const Provider = ConnectorsContext.Provider

export default function useConnectors() {
  const connectors = useContext(ConnectorsContext)
  invariant(connectors, 'useConnectors used without initializing the context')
  return connectors
}
