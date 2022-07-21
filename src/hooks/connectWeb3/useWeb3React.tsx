import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector, Provider as Eip1193Provider, Web3ReactStore } from '@web3-react/types'
import { Url } from '@web3-react/url'
import { WalletConnect } from '@web3-react/walletconnect'
import { SupportedChainId } from 'constants/chains'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'

export type Web3Connection = [Connector, Web3ReactHooks]
export let connections: Web3Connection[] = []

function toWeb3Connection<T extends Connector>([connector, hooks]: [
  T,
  Web3ReactHooks,
  Web3ReactStore
]): Web3Connection {
  return [connector, hooks]
}

export function getConnectorName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof Network) return 'Network'
  if (connector instanceof Url) return 'Url'
  if (connector instanceof EIP1193) return 'EIP1193'
  return 'Unknown'
}

function getWalletFromProvider(onError: (error: Error) => void, provider?: JsonRpcProvider | Eip1193Provider) {
  if (!provider) return
  if (JsonRpcProvider.isProvider(provider)) {
    return toWeb3Connection(initializeConnector((actions) => new Url({ actions, url: provider })))
  } else if (JsonRpcProvider.isProvider((provider as any).provider)) {
    throw new Error('Eip1193Bridge is experimental: pass your ethers Provider directly')
  } else {
    return toWeb3Connection(initializeConnector((actions) => new EIP1193({ actions, provider, onError })))
  }
}

function getWalletFromWalletConnect(
  useDefault: boolean,
  onError: (error: Error) => void,
  jsonRpcEndpoint?: string | JsonRpcProvider
): Web3Connection {
  // WalletConnect relies on Buffer, so it must be polyfilled.
  if (!('Buffer' in window)) {
    window.Buffer = Buffer
  }

  // FIXME(kristiehuang): we don't know what the props.jsonRpcEndpoint chain is; assume mainnet for WC instantiation
  let mainnetRpcUrl: string | undefined
  if (JsonRpcProvider.isProvider(jsonRpcEndpoint)) {
    mainnetRpcUrl = jsonRpcEndpoint.connection.url
  } else {
    mainnetRpcUrl = jsonRpcEndpoint
  }
  return toWeb3Connection(
    initializeConnector<WalletConnect>(
      (actions) =>
        new WalletConnect({
          actions,
          options: {
            rpc: {
              [SupportedChainId.MAINNET]: [
                mainnetRpcUrl ?? '',
                ...(JSON_RPC_FALLBACK_ENDPOINTS[SupportedChainId.MAINNET] ?? []),
              ].filter((url) => url !== undefined && url !== ''),
              [SupportedChainId.RINKEBY]: JSON_RPC_FALLBACK_ENDPOINTS[SupportedChainId.RINKEBY] ?? [],
            },
            qrcode: useDefault,
          },
          onError,
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
  const onError = console.error

  const integratorConnection = useMemo(() => getWalletFromProvider(onError, propsProvider), [propsProvider])
  const metaMaskConnection = useMemo(
    () => toWeb3Connection(initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))),
    []
  )
  const walletConnectConnectionQR = useMemo(
    () => getWalletFromWalletConnect(false, onError, jsonRpcEndpoint),
    [jsonRpcEndpoint]
  ) // WC via tile QR code scan
  const walletConnectConnectionPopup = useMemo(
    () => getWalletFromWalletConnect(true, onError, jsonRpcEndpoint),
    [jsonRpcEndpoint]
  ) // WC via built-in popup

  const networkConnection = useMemo(() => {
    if (!jsonRpcEndpoint) return
    const networkRpc = JsonRpcProvider.isProvider(jsonRpcEndpoint) ? [jsonRpcEndpoint] : [jsonRpcEndpoint]
    const urlMap = { [SupportedChainId.MAINNET]: networkRpc }
    return toWeb3Connection(initializeConnector<Network>((actions) => new Network({ actions, urlMap })))
  }, [jsonRpcEndpoint])

  connections = [metaMaskConnection, walletConnectConnectionQR, walletConnectConnectionPopup]
  if (integratorConnection) connections = [integratorConnection, ...connections]
  if (networkConnection) connections.push(networkConnection)

  return (
    <Web3ReactProvider connectors={connections} key={connections.length}>
      {children}
    </Web3ReactProvider>
  )
}
