import { JsonRpcProvider } from '@ethersproject/providers'
import { initializeConnector, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector, Provider as Eip1193Provider } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { SupportedChainId } from 'constants/chains'
import { PropsWithChildren, useEffect, useMemo, useRef } from 'react'
import JsonRpcConnector from 'utils/JsonRpcConnector'

import { Provider as ConnectorsProvider } from './useConnectors'
import { JsonRpcUrlMap, Provider as JsonRpcUrlMapProvider, toJsonRpcUrlMap } from './useJsonRpcUrlMap'

type Web3ReactConnector<T extends Connector = Connector> = [T, Web3ReactHooks]

interface Web3ReactConnectors {
  user: Web3ReactConnector<EIP1193 | JsonRpcConnector> | undefined
  metaMask: Web3ReactConnector<MetaMask>
  walletConnect: Web3ReactConnector<WalletConnect>
  walletConnectQR: Web3ReactConnector<WalletConnect>
  network: Web3ReactConnector<Network>
}

interface ProviderProps {
  defaultChainId?: SupportedChainId
  jsonRpcUrlMap?: JsonRpcUrlMap
  provider?: Eip1193Provider | JsonRpcProvider
}

export function Provider({
  defaultChainId = SupportedChainId.MAINNET,
  jsonRpcUrlMap: propsJsonRpcUrlMap,
  provider,
  children,
}: PropsWithChildren<ProviderProps>) {
  const jsonRpcUrlMap = useMemo(() => toJsonRpcUrlMap(propsJsonRpcUrlMap), [propsJsonRpcUrlMap])
  const web3ReactConnectors = useWeb3ReactConnectors(defaultChainId, jsonRpcUrlMap, provider)

  const key = useRef(0)
  const prioritizedConnectors = useMemo(() => {
    // Re-key Web3ReactProvider before rendering new connectors, as it expects connectors to be
    // referentially static.
    key.current += 1

    const prioritizedConnectors: (Web3ReactConnector | undefined)[] = [
      web3ReactConnectors.user,
      web3ReactConnectors.metaMask,
      web3ReactConnectors.walletConnectQR,
      web3ReactConnectors.walletConnect,
      web3ReactConnectors.network,
    ]
    return prioritizedConnectors.filter((connector): connector is Web3ReactConnector => Boolean(connector))
  }, [web3ReactConnectors])

  const connectors = useMemo(
    () => ({
      user: web3ReactConnectors.user?.[0],
      metaMask: web3ReactConnectors.metaMask[0],
      walletConnect: web3ReactConnectors.walletConnect[0],
      walletConnectQR: web3ReactConnectors.walletConnectQR[0],
      network: web3ReactConnectors.network[0],
    }),
    [web3ReactConnectors]
  )

  // Attempt to connect eagerly if there is no user-provided provider.
  useEffect(() => {
    // Ignore any errors during connection so they do not propagate to the widget.
    if (connectors.user) {
      connectors.user.activate().catch(() => undefined)
      return
    }
    for (const connector of [connectors.metaMask, connectors.walletConnect]) {
      connector.connectEagerly().catch(() => undefined)
    }
    connectors.network.activate().catch(() => undefined)
  }, [connectors.metaMask, connectors.network, connectors.user, connectors.walletConnect])

  return (
    <Web3ReactProvider connectors={prioritizedConnectors} key={key.current}>
      <JsonRpcUrlMapProvider value={jsonRpcUrlMap}>
        <ConnectorsProvider value={connectors}>{children}</ConnectorsProvider>
      </JsonRpcUrlMapProvider>
    </Web3ReactProvider>
  )
}

const onError = (error: Error) => console.error(error)

function initializeWeb3ReactConnector<T extends Connector, P extends object>(
  Constructor: { new (options: P): T },
  options?: Omit<P, 'actions'>
): Web3ReactConnector<T> {
  const [connector, hooks] = initializeConnector((actions) => new Constructor({ actions, onError, ...options } as P))
  return [connector, hooks]
}

function useWeb3ReactConnectors(
  defaultChainId: SupportedChainId,
  jsonRpcUrlMap: JsonRpcUrlMap,
  provider?: Eip1193Provider | JsonRpcProvider
) {
  const user = useMemo(() => {
    if (!provider) return
    if (JsonRpcProvider.isProvider(provider)) {
      return initializeWeb3ReactConnector(JsonRpcConnector, { provider })
    } else if (JsonRpcProvider.isProvider((provider as any).provider)) {
      throw new Error('Eip1193Bridge is experimental: pass your ethers Provider directly')
    } else {
      return initializeWeb3ReactConnector(EIP1193, { provider })
    }
  }, [provider])
  const metaMask = useMemo(() => initializeWeb3ReactConnector(MetaMask), [])
  const walletConnect = useMemo(
    () =>
      initializeWeb3ReactConnector(WalletConnect, { options: { rpc: jsonRpcUrlMap, qrcode: true }, defaultChainId }),
    [defaultChainId, jsonRpcUrlMap]
  ) // WC via built-in popup
  const walletConnectQR = useMemo(
    () =>
      initializeWeb3ReactConnector(WalletConnect, { options: { rpc: jsonRpcUrlMap, qrcode: false }, defaultChainId }),
    [jsonRpcUrlMap, defaultChainId]
  ) // WC via tile QR code scan
  const network = useMemo(
    () => initializeWeb3ReactConnector(Network, { urlMap: jsonRpcUrlMap, defaultChainId }),
    [jsonRpcUrlMap, defaultChainId]
  )
  return useMemo<Web3ReactConnectors>(
    () => ({
      user,
      metaMask,
      walletConnect,
      walletConnectQR,
      network,
    }),
    [metaMask, network, user, walletConnect, walletConnectQR]
  )
}
