import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect-v2'
import { L1_CHAIN_IDS, L2_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import { useEffect, useState } from 'react'

import useOption from './useOption'

enum Wallet {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
}
const [metaMask] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))

const WALLET_CONNECT_PROJECT_ID = 'c6c9bacd35afa3eb9e6cccf6d8464395'
const [walletConnect] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpcMap: Object.entries(JSON_RPC_FALLBACK_ENDPOINTS).reduce((rpcMap, [chainId, rpcUrls]) => ({
          ...rpcMap,
          [chainId]: rpcUrls.slice(0, 1),
        })),
        showQrModal: true,
        projectId: WALLET_CONNECT_PROJECT_ID,
        // this requires the connecting wallet to support eth mainnet
        chains: [SupportedChainId.MAINNET],
        optionalChains: [...L1_CHAIN_IDS, ...L2_CHAIN_IDS],
        optionalMethods: ['eth_signTypedData', 'eth_signTypedData_v4', 'eth_sign'],
      },
    })
)

export default function useProvider(defaultChainId?: number) {
  const connectorType = useOption('provider', { options: [Wallet.MetaMask, Wallet.WalletConnect] })
  const [connector, setConnector] = useState<Connector>()
  useEffect(() => {
    let stale = false
    activateConnector(connectorType)
    return () => {
      stale = true
    }

    async function activateConnector(connectorType: Wallet | undefined) {
      let connector: Connector | undefined
      switch (connectorType) {
        case Wallet.MetaMask:
          await metaMask.activate(defaultChainId)
          connector = metaMask
          break
        case Wallet.WalletConnect:
          await walletConnect.activate(defaultChainId)
          connector = walletConnect
      }
      if (!stale) {
        setConnector((oldConnector) => {
          oldConnector?.deactivate?.()
          return connector
        })
      }
    }
  }, [connectorType, defaultChainId])

  return connector?.provider
}
