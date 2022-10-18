import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { SupportedChainId } from 'constants/chains'
import { useEffect, useState } from 'react'

import useOption from './useOption'

const INFURA_KEY = process.env.INFURA_KEY
if (INFURA_KEY === undefined) {
  console.error(`INFURA_KEY must be a defined environment variable to use jsonRpcUrlMap in the cosmos viewer`)
}

export const INFURA_NETWORK_URLS: { [chainId: number]: string[] } = INFURA_KEY
  ? {
      [SupportedChainId.MAINNET]: [`https://mainnet.infura.io/v3/${INFURA_KEY}`],
      [SupportedChainId.RINKEBY]: [`https://rinkeby.infura.io/v3/${INFURA_KEY}`],
      [SupportedChainId.ROPSTEN]: [`https://ropsten.infura.io/v3/${INFURA_KEY}`],
      [SupportedChainId.GOERLI]: [`https://goerli.infura.io/v3/${INFURA_KEY}`],
      [SupportedChainId.KOVAN]: [`https://kovan.infura.io/v3/${INFURA_KEY}`],
      [SupportedChainId.OPTIMISM]: [`https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`],
      [SupportedChainId.OPTIMISTIC_KOVAN]: [`https://optimism-kovan.infura.io/v3/${INFURA_KEY}`],
      [SupportedChainId.ARBITRUM_ONE]: [`https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`],
      [SupportedChainId.ARBITRUM_RINKEBY]: [`https://arbitrum-rinkeby.infura.io/v3/${INFURA_KEY}`],
      [SupportedChainId.POLYGON]: [`https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`],
      [SupportedChainId.POLYGON_MUMBAI]: [`https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`],
    }
  : {}

enum Wallet {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
}
const [metaMask] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))
const [walletConnect] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: INFURA_NETWORK_URLS as { [chainId: number]: string[] },
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
