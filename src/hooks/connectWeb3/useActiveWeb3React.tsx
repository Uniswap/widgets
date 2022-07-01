import { ExternalProvider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { Eip1193Provider, SupportedChainId } from '@uniswap/widgets'
import { initializeConnector, useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { EMPTY } from '@web3-react/empty'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector, Web3ReactStore } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { Buffer } from 'buffer'
import { createContext, PropsWithChildren, useMemo } from 'react'
import { useCallback } from 'react'
import JsonRpcConnector from 'utils/JsonRpcConnector'

export type Web3ContextType = {
  connector: Connector
  library?: (JsonRpcProvider & { provider?: ExternalProvider }) | Web3Provider
  chainId?: ReturnType<Web3ReactHooks['useChainId']>
  accounts?: ReturnType<Web3ReactHooks['useAccounts']>
  account?: ReturnType<Web3ReactHooks['useAccount']>
  active?: ReturnType<Web3ReactHooks['useIsActive']>
  activating?: ReturnType<Web3ReactHooks['useIsActivating']>
}

const [EMPTY_CONNECTOR, EMPTY_HOOKS] = initializeConnector<Connector>(() => EMPTY)
const EMPTY_WEB3: Web3ContextType = { connector: EMPTY }
const EMPTY_CONTEXT = { web3: EMPTY_WEB3, updateWeb3: (updateContext: Web3ContextType) => console.log(updateContext) }
const Web3Context = createContext(EMPTY_CONTEXT)

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
    return toWeb3Connection(initializeConnector((actions) => new JsonRpcConnector(actions, provider)))
  } else if (JsonRpcProvider.isProvider((provider as any).provider)) {
    throw new Error('Eip1193Bridge is experimental: pass your ethers Provider directly')
  } else {
    return toWeb3Connection(initializeConnector((actions) => new EIP1193({ actions, provider })))
  }
}

interface ActiveWeb3ProviderProps {
  jsonRpcEndpoint?: string | JsonRpcProvider
  provider?: Eip1193Provider | JsonRpcProvider
}

export function ActiveWeb3Provider({
  jsonRpcEndpoint,
  provider,
  children,
}: PropsWithChildren<ActiveWeb3ProviderProps>) {
  const getWalletConnectConnection = useCallback((useDefault: boolean, jsonRpcEndpoint?: string | JsonRpcProvider) => {
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
  }, [])

  const metaMaskConnection = useMemo(
    () => toWeb3Connection(initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))),
    []
  )
  const walletConnectConnectionQR = useMemo(
    () => getWalletConnectConnection(false, jsonRpcEndpoint),
    [getWalletConnectConnection, jsonRpcEndpoint]
  ) // WC via tile QR code scan
  const walletConnectConnectionPopup = useMemo(
    () => getWalletConnectConnection(true, jsonRpcEndpoint),
    [getWalletConnectConnection, jsonRpcEndpoint]
  ) // WC via built-in popup
  const networkConnection = useMemo(() => {
    let network
    if (JsonRpcProvider.isProvider(jsonRpcEndpoint)) {
      network = [jsonRpcEndpoint]
    } else {
      network = [jsonRpcEndpoint ?? '']
    }
    const urlMap = { [SupportedChainId.MAINNET]: network }
    return toWeb3Connection(initializeConnector<Network>((actions) => new Network({ actions, urlMap })))
  }, [jsonRpcEndpoint])

  if (provider) {
    connections = [
      getWallet(provider),
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
