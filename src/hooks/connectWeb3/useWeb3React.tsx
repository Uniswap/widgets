import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'

import { Connector, Provider as Eip1193Provider, Web3ReactStore } from '@web3-react/types'
import { Url } from '@web3-react/url'
import { WalletConnect } from '@web3-react/walletconnect'
import { SupportedChainId } from 'constants/chains'
import { PropsWithChildren, useMemo } from 'react'

export let connections: [Connector, Web3ReactHooks][] = []
export type Web3Connection = [Connector, Web3ReactHooks]

function toWeb3Connection<T extends Connector>([connector, hooks]: [T, Web3ReactHooks, Web3ReactStore]): [
  T,
  Web3ReactHooks
] {
  return [connector, hooks]
}

function getWallet(provider?: JsonRpcProvider | Eip1193Provider) {
  if (!provider) return
  if (JsonRpcProvider.isProvider(provider)) {
    return toWeb3Connection(initializeConnector((actions) => new Url({ actions, url: provider })))
  } else if (JsonRpcProvider.isProvider((provider as any).provider)) {
    throw new Error('Eip1193Bridge is experimental: pass your ethers Provider directly')
  } else {
    return toWeb3Connection(initializeConnector((actions) => new EIP1193({ actions, provider })))
  }
}

function getWalletConnectConnection(
  useDefault: boolean,
  jsonRpcEndpoint: string | JsonRpcProvider | { [chainId: number]: string[] },
  defaultChainId?: number
) {
  let urlMap: { [chainId: number]: string[] }
  if (JsonRpcProvider.isProvider(jsonRpcEndpoint)) {
    jsonRpcEndpoint
      .getNetwork()
      .then((network) => {
        urlMap = { [network.chainId]: [jsonRpcEndpoint.connection.url] }
        return toWeb3Connection(
          initializeConnector<WalletConnect>(
            (actions) =>
              new WalletConnect({
                actions,
                options: {
                  rpc: urlMap,
                  qrcode: useDefault,
                },
              })
          )
        )
      })
      .catch((e) => {
        throw new Error('Could not connect WalletConnect: ', e)
      })
  } else if (typeof jsonRpcEndpoint === 'string') {
    // if integrator only provides a jsonRpcEndpoint string, user switching networks on their wallet will not work as expected
    urlMap = { [defaultChainId ?? SupportedChainId.MAINNET]: [jsonRpcEndpoint] }
  } else {
    urlMap = jsonRpcEndpoint
  }

  return toWeb3Connection(
    initializeConnector<WalletConnect>(
      (actions) =>
        new WalletConnect({
          actions,
          options: {
            rpc: urlMap,
            qrcode: useDefault,
          },
        })
    )
  )
}

interface ActiveWeb3ProviderProps {
  provider?: Eip1193Provider | JsonRpcProvider
  jsonRpcEndpoint: string | JsonRpcProvider | { [chainId: number]: string[] }
  defaultChainId?: number
}

export function ActiveWeb3Provider({
  provider: propsProvider,
  jsonRpcEndpoint,
  defaultChainId,
  children,
}: PropsWithChildren<ActiveWeb3ProviderProps>) {
  const integratorConnection = useMemo(() => getWallet(propsProvider), [propsProvider])
  const metaMaskConnection = useMemo(
    () => toWeb3Connection(initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))),
    []
  )
  const walletConnectConnectionQR = useMemo(
    () => getWalletConnectConnection(false, jsonRpcEndpoint, defaultChainId),
    [jsonRpcEndpoint, defaultChainId]
  ) // WC via tile QR code scan
  const walletConnectConnectionPopup = useMemo(
    () => getWalletConnectConnection(true, jsonRpcEndpoint, defaultChainId),
    [jsonRpcEndpoint, defaultChainId]
  ) // WC via built-in popup

  const networkConnection = useMemo(() => {
    if (JsonRpcProvider.isProvider(jsonRpcEndpoint) || typeof jsonRpcEndpoint === 'string') {
      return toWeb3Connection(initializeConnector<Url>((actions) => new Url({ actions, url: jsonRpcEndpoint })))
    } else {
      return toWeb3Connection(
        initializeConnector<Network>((actions) => new Network({ actions, urlMap: jsonRpcEndpoint, defaultChainId }))
      )
    }
  }, [jsonRpcEndpoint, defaultChainId])

  connections = [metaMaskConnection, walletConnectConnectionQR, walletConnectConnectionPopup, networkConnection]
  if (integratorConnection) connections = [integratorConnection, ...connections]

  return (
    <Web3ReactProvider connectors={connections} key={'' + connections.length + jsonRpcEndpoint}>
      {children}
    </Web3ReactProvider>
  )
}
