import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector, useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector, Provider as Eip1193Provider, Web3ReactStore } from '@web3-react/types'
import { Url } from '@web3-react/url'
import { WalletConnect } from '@web3-react/walletconnect'
import { Buffer } from 'buffer'
import { SupportedChainId } from 'constants/chains'
import { PropsWithChildren, useMemo } from 'react'
import { useCallback } from 'react'

export default function useActiveWeb3React() {
  return useWeb3React()
}

export let connections: [Connector, Web3ReactHooks][] = []
export type Web3Connection = [Connector, Web3ReactHooks]

function toWeb3Connection<T extends Connector>([connector, hooks]: [T, Web3ReactHooks, Web3ReactStore]): [
  T,
  Web3ReactHooks
] {
  return [connector, hooks]
}

function getWallet(provider: JsonRpcProvider | Eip1193Provider) {
  if (JsonRpcProvider.isProvider(provider)) {
    return toWeb3Connection(initializeConnector((actions) => new Url({ actions, url: provider })))
  } else if (JsonRpcProvider.isProvider((provider as any).provider)) {
    throw new Error('Eip1193Bridge is experimental: pass your ethers Provider directly')
  } else {
    return toWeb3Connection(initializeConnector((actions) => new EIP1193({ actions, provider })))
  }
}

function getWalletConnectConnection(useDefault: boolean, jsonRpcEndpoint?: string | JsonRpcProvider) {
  // TODO(kristiehuang): implement RPC URL fallback, then jsonRpcEndpoint can be optional

  // WalletConnect relies on Buffer, so it must be polyfilled.
  if (!('Buffer' in window)) {
    window.Buffer = Buffer
  }

  let rpcUrl: string
  if (JsonRpcProvider.isProvider(jsonRpcEndpoint)) {
    rpcUrl = jsonRpcEndpoint.connection.url
  } else {
    rpcUrl = jsonRpcEndpoint ?? '' // TODO(kristiehuang): use fallback RPC URL
  }

  return toWeb3Connection(
    initializeConnector<WalletConnect>(
      (actions) =>
        new WalletConnect({
          actions,
          options: {
            rpc: {
              1: [rpcUrl].filter((url) => url !== undefined && url !== ''),
            },
            qrcode: useDefault,
          }, // TODO(kristiehuang): WC only works on network chainid 1?
        })
    )
  )
}

interface ActiveWeb3ProviderProps {
  provider?: Eip1193Provider | JsonRpcProvider
  jsonRpcEndpoint?: string | JsonRpcProvider
}

export function ActiveWeb3Provider({
  provider: propsProvider,
  jsonRpcEndpoint,
  children,
}: PropsWithChildren<ActiveWeb3ProviderProps>) {
  const metaMaskConnection = useMemo(
    () => toWeb3Connection(initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))),
    []
  )
  const walletConnectConnectionQR = useMemo(() => getWalletConnectConnection(false, jsonRpcEndpoint), [jsonRpcEndpoint]) // WC via tile QR code scan
  const walletConnectConnectionPopup = useMemo(
    () => getWalletConnectConnection(true, jsonRpcEndpoint),
    [jsonRpcEndpoint]
  ) // WC via built-in popup

  const networkConnection = useMemo(() => {
    let network: string[] | JsonRpcProvider[]
    if (JsonRpcProvider.isProvider(jsonRpcEndpoint)) {
      network = [jsonRpcEndpoint]
    } else {
      network = [jsonRpcEndpoint ?? '']
    }
    const urlMap = { [SupportedChainId.MAINNET]: network }
    const connection = toWeb3Connection(initializeConnector<Network>((actions) => new Network({ actions, urlMap })))
    connection[0].activate() // Activate network immediately after instantiation
    return connection
  }, [jsonRpcEndpoint])

  if (propsProvider) {
    connections = [
      getWallet(propsProvider),
      metaMaskConnection,
      walletConnectConnectionQR,
      walletConnectConnectionPopup,
      networkConnection,
    ]
  } else {
    connections = [metaMaskConnection, walletConnectConnectionQR, walletConnectConnectionPopup, networkConnection]
  }

  return <Web3ReactProvider connectors={connections}>{children}</Web3ReactProvider>
}

export function useConnectCallback(connection: Web3Connection) {
  const [wallet, hooks] = connection
  const isActive = hooks.useIsActive()

  const activateWallet = useCallback(() => {
    if (!isActive) {
      wallet.activate()
    }
  }, [isActive, wallet])

  return activateWallet
}
