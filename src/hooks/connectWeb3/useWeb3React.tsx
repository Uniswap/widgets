import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector, Provider as Eip1193Provider, Web3ReactStore } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { SupportedChainId } from 'constants/chains'
import { atom, useAtom } from 'jotai'
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
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

  // we're abusing useState a bit to ensure that `metaMaskConnection` is only ever computed once, i.e. is referentially static
  const [metaMaskConnection] = useState(() =>
    toWeb3Connection(initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError })))
  )
  const walletConnectConnectionQR = useMemo(
    () => getConnectionFromWalletConnect(false, jsonRpcUrlMap, defaultChainId, onError),
    [jsonRpcUrlMap, defaultChainId]
  ) // WC via tile QR code scan
  const walletConnectConnectionPopup = useMemo(
    () => getConnectionFromWalletConnect(true, jsonRpcUrlMap, defaultChainId, onError),
    [jsonRpcUrlMap, defaultChainId]
  ) // WC via built-in popup
  const networkConnection = useMemo(
    () =>
      toWeb3Connection(
        initializeConnector<Network>((actions) => new Network({ actions, urlMap: jsonRpcUrlMap, defaultChainId }))
      ),
    [jsonRpcUrlMap, defaultChainId]
  )

  const integratorConnection = useMemo(() => getConnectionFromProvider(onError, provider), [provider])

  connections = [metaMaskConnection, walletConnectConnectionQR, walletConnectConnectionPopup, networkConnection]
  if (integratorConnection) connections = [integratorConnection, ...connections]
  const connectionsLast = useRef(connections)

  const key = useRef(0)
  // connections at this point is up-to-date, and connectionsLast is either (on the first render), equal to connections,
  // or (on subsequent renders), equal to the previous value.
  if (
    connectionsLast.current.length !== connections.length ||
    connectionsLast.current.some((connectionLast, i) => {
      return connectionLast[0] !== connections[i][0]
    })
  ) {
    key.current = key.current + 1
  }
  // ensure that connectionsLast is updated to the current value of connections
  connectionsLast.current = connections

  return (
    <Web3ReactProvider connectors={connections} key={key.current}>
      {children}
    </Web3ReactProvider>
  )
}
