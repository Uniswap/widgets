import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector, Provider as Eip1193Provider, Web3ReactStore } from '@web3-react/types'
import { Url } from '@web3-react/url'
import { WalletConnect } from '@web3-react/walletconnect'
import { atom, useAtom } from 'jotai'
import { PropsWithChildren, useEffect, useMemo } from 'react'

export type Web3Connection = [Connector, Web3ReactHooks]
export let connections: Web3Connection[] = []
export const defaultChainIdAtom = atom<number>(1)

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
  jsonRpcUrlMap: { [chainId: number]: string[] },
  defaultChainId: number
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
          defaultChainId,
        })
    )
  )
}

interface ActiveWeb3ProviderProps {
  provider?: Eip1193Provider | JsonRpcProvider
  jsonRpcUrlMap: { [chainId: number]: string[] }
  defaultChainId: number
}

export function ActiveWeb3Provider({
  provider,
  jsonRpcUrlMap,
  defaultChainId: propsDefaultChainId,
  children,
}: PropsWithChildren<ActiveWeb3ProviderProps>) {
  const [defaultChainId, setDefaultChainId] = useAtom(defaultChainIdAtom)
  useEffect(() => {
    if (propsDefaultChainId !== defaultChainId) setDefaultChainId(propsDefaultChainId)
  }, [propsDefaultChainId, defaultChainId, setDefaultChainId])

  const integratorConnection = useMemo(() => getWallet(provider), [provider])
  const metaMaskConnection = useMemo(
    () => toWeb3Connection(initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))),
    []
  )
  const walletConnectConnectionQR = useMemo(
    () => getWalletConnectConnection(false, jsonRpcUrlMap, defaultChainId),
    [jsonRpcUrlMap, defaultChainId]
  ) // WC via tile QR code scan
  const walletConnectConnectionPopup = useMemo(
    () => getWalletConnectConnection(true, jsonRpcUrlMap, defaultChainId),
    [jsonRpcUrlMap, defaultChainId]
  ) // WC via built-in popup

  const networkConnection = useMemo(
    () =>
      toWeb3Connection(
        initializeConnector<Network>((actions) => new Network({ actions, urlMap: jsonRpcUrlMap, defaultChainId }))
      ),
    [jsonRpcUrlMap, defaultChainId]
  )

  connections = [metaMaskConnection, walletConnectConnectionQR, walletConnectConnectionPopup, networkConnection]
  if (integratorConnection) connections = [integratorConnection, ...connections]

  const key = `${connections.length}+${Object.keys(jsonRpcUrlMap)}+${propsDefaultChainId}+${defaultChainId}`
  return (
    <Web3ReactProvider connectors={connections} key={key}>
      {children}
    </Web3ReactProvider>
  )
}
