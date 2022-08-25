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

const onError = (error: Error) => console.error(error)

interface ActiveWeb3ProviderProps {
  provider?: Eip1193Provider | JsonRpcProvider
  jsonRpcUrlMap: { [chainId: number]: string | string[] }
  defaultChainId: SupportedChainId
}

export function ActiveWeb3Provider({
  jsonRpcUrlMap: propsJsonRpcUrlMap,
  defaultChainId: propsDefaultChainId,
  provider,
  children,
}: PropsWithChildren<ActiveWeb3ProviderProps>) {
  const jsonRpcUrlMap = useMemo(
    () =>
      Object.entries(propsJsonRpcUrlMap).reduce(
        (urlMap, [id, urls]) => ({ ...urlMap, [id]: Array.isArray(urls) ? urls : [urls] }),
        {}
      ),
    [propsJsonRpcUrlMap]
  )

  const [defaultChainId, setDefaultChainId] = useAtom(defaultChainIdAtom)
  useEffect(() => {
    if (propsDefaultChainId !== defaultChainId) setDefaultChainId(propsDefaultChainId)
  }, [propsDefaultChainId, defaultChainId, setDefaultChainId])

  const integratorConnection = useMemo(() => getConnectionFromProvider(onError, provider), [provider])
  const metaMaskConnection = useMemo(
    () => toWeb3Connection(initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))),
    []
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

  // TODO(zzmp): Only expose connections through hooks. For now, it is aliased to connections to export it.
  // It must also be a local variable (connectors) to satisfy the react-hooks/exhaustive-deps check.
  const connectors = (connections = useMemo(() => {
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
  ]))

  const key = useRef(0)
  useEffect(() => {
    // Re-key Web3ReactProvider if connectors change, to force a re-render.
    // This is necessary because Web3ReactProvider expects connectors to be constant, so
    // changing the passed connectors requires a new instance of Web3ReactProvider.
    // This *must* be done in a useEffect so that it does not run on mount when parent components update.
    void connectors
    key.current += 1
  }, [connectors])

  return (
    <Web3ReactProvider connectors={connectors} key={key.current}>
      {children}
    </Web3ReactProvider>
  )
}
