import { useWeb3React } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { createContext, PropsWithChildren, useContext, useEffect } from 'react'
import invariant from 'tiny-invariant'
import JsonRpcConnector from 'utils/JsonRpcConnector'
import { WalletConnectPopup, WalletConnectQR } from 'utils/WalletConnect'

export interface Connectors {
  user: EIP1193 | JsonRpcConnector | undefined
  metaMask: MetaMask
  walletConnect: WalletConnectPopup
  walletConnectQR: WalletConnectQR
  network: Network
}

const ConnectorsContext = createContext<Connectors | null>(null)

export function Provider({ connectors, children }: PropsWithChildren<{ connectors: Connectors }>) {
  const { chainId, connector } = useWeb3React()
  // The network chainId must be kept synchronized to avoid a loop when disconnecting and for a better UX.
  useEffect(() => {
    if (connector !== connectors.network) {
      try {
        connectors.network.activate(chainId)
      } catch (e) {
        // Unknown chains (eg hardhat) will fail to connect, and should not crash
      }
    }
  }, [chainId, connector, connectors.network])

  return <ConnectorsContext.Provider value={connectors}>{children}</ConnectorsContext.Provider>
}

export default function useConnectors() {
  const connectors = useContext(ConnectorsContext)
  invariant(connectors, 'useConnectors used without initializing the context')
  return connectors
}
