import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector, Provider as Eip1193Provider, Web3ReactStore } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { SupportedChainId } from 'constants/chains'
import { atom, useAtom } from 'jotai'
import { PropsWithChildren, useEffect, useMemo, useRef } from 'react'
import JsonRpcConnector from 'utils/JsonRpcConnector'

export type Web3Connection = [Connector, Web3ReactHooks]
export let connections: Web3Connection[] = []
export const defaultChainIdAtom = atom<number>(1)

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
  if (connector instanceof JsonRpcConnector) return 'JsonRpcConnector'
  if (connector instanceof EIP1193) return 'EIP1193'
  return 'Unknown'
}

function getConnectionFromProvider(onError: (error: Error) => void, provider?: JsonRpcProvider | Eip1193Provider) {
  if (!provider) return
  if (JsonRpcProvider.isProvider(provider)) {
    return toWeb3Connection(initializeConnector((actions) => new JsonRpcConnector(actions, provider)))
  } else if (JsonRpcProvider.isProvider((provider as any).provider)) {
    throw new Error('Eip1193Bridge is experimental: pass your ethers Provider directly')
  } else {
    return toWeb3Connection(initializeConnector((actions) => new EIP1193({ actions, provider, onError })))
  }
}

function getConnectionFromWalletConnect(
  useDefault: boolean,
  jsonRpcUrlMap: { [chainId: number]: string[] },
  defaultChainId: SupportedChainId,
  onError: (error: Error) => void
) {
  return toWeb3Connection(
    initializeConnector<WalletConnect>(
      (actions) =>
        new WalletConnect({
          actions,
          options: {
            rpc: jsonRpcUrlMap,
            qrcode: useDefault,
          },
          onError,
          defaultChainId,
        })
    )
  )
}

interface ActiveWeb3ProviderProps {
  provider?: Eip1193Provider | JsonRpcProvider
  jsonRpcUrlMap: { [chainId: number]: string[] }
  defaultChainId: SupportedChainId
}

export function ActiveWeb3Provider({
  provider,
  jsonRpcUrlMap,
  defaultChainId: propsDefaultChainId,
  children,
}: PropsWithChildren<ActiveWeb3ProviderProps>) {
  const onError = console.error
  const [defaultChainId, setDefaultChainId] = useAtom(defaultChainIdAtom)
  useEffect(() => {
    if (propsDefaultChainId !== defaultChainId) setDefaultChainId(propsDefaultChainId)
  }, [propsDefaultChainId, defaultChainId, setDefaultChainId])

  const integratorConnection = useMemo(() => getConnectionFromProvider(onError, provider), [onError, provider])
  const metaMaskConnection = useMemo(
    () => toWeb3Connection(initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))),
    [onError]
  )
  const walletConnectConnectionQR = useMemo(
    () => getConnectionFromWalletConnect(false, jsonRpcUrlMap, defaultChainId, onError),
    [jsonRpcUrlMap, defaultChainId, onError]
  ) // WC via tile QR code scan
  const walletConnectConnectionPopup = useMemo(
    () => getConnectionFromWalletConnect(true, jsonRpcUrlMap, defaultChainId, onError),
    [jsonRpcUrlMap, defaultChainId, onError]
  ) // WC via built-in popup

  const networkConnection = useMemo(
    () =>
      toWeb3Connection(
        initializeConnector<Network>((actions) => new Network({ actions, urlMap: jsonRpcUrlMap, defaultChainId }))
      ),
    [jsonRpcUrlMap, defaultChainId]
  )

  const key = useRef(0)
  connections = useMemo(() => {
    // while react warns against triggering side effects in useMemo,
    // in this instance we're only using the mutated value to generate a key,
    // so tightly coupling the key update with the memo update shouldn't cause any issues,
    // and most clearly expresses the intent
    key.current += 1
    return [
      integratorConnection,
      metaMaskConnection,
      walletConnectConnectionQR,
      walletConnectConnectionPopup,
      networkConnection,
    ].filter((connection): connection is Web3Connection => Boolean(connection))
  }, [
    integratorConnection,
    metaMaskConnection,
    walletConnectConnectionQR,
    walletConnectConnectionPopup,
    networkConnection,
  ])

  return (
    <Web3ReactProvider connectors={connections} key={key.current}>
      {children}
    </Web3ReactProvider>
  )
}
