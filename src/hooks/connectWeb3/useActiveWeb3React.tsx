import { ExternalProvider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { getPriorityConnector, initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { EMPTY } from '@web3-react/empty'
import { MetaMask } from '@web3-react/metamask'
import { Connector, Provider as Eip1193Provider, Web3ReactStore } from '@web3-react/types'
import { Url } from '@web3-react/url'
import { WalletConnect } from '@web3-react/walletconnect'
import { Buffer } from 'buffer'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
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
const EMPTY_STATE = { connector: EMPTY_CONNECTOR, hooks: EMPTY_HOOKS }
const EMPTY_WEB3: Web3ContextType = { connector: EMPTY }
const EMPTY_CONTEXT = { web3: EMPTY_WEB3, updateWeb3: (updateContext: Web3ContextType) => console.log(updateContext) }
const Web3Context = createContext(EMPTY_CONTEXT)

export default function useActiveWeb3React() {
  const { web3 } = useContext(Web3Context)
  return web3
}

export function useUpdateActiveWeb3ReactCallback() {
  const { updateWeb3 } = useContext(Web3Context)
  return updateWeb3
}

export function getNetwork(jsonRpcEndpoint?: string | JsonRpcProvider) {
  if (jsonRpcEndpoint) {
    let connector, hooks
    if (JsonRpcProvider.isProvider(jsonRpcEndpoint)) {
      ;[connector, hooks] = initializeConnector((actions) => new JsonRpcConnector(actions, jsonRpcEndpoint))
    } else {
      ;[connector, hooks] = initializeConnector((actions) => new Url({ actions, url: jsonRpcEndpoint }))
    }
    connector.activate()
    return { connector, hooks }
  }
  return EMPTY_STATE
}

function getWallet(provider?: JsonRpcProvider | Eip1193Provider) {
  console.log('wallet provider is', provider)
  if (provider) {
    let connector, hooks
    if (JsonRpcProvider.isProvider(provider)) {
      ;[connector, hooks] = initializeConnector((actions) => new JsonRpcConnector(actions, provider))
    } else if (JsonRpcProvider.isProvider((provider as any).provider)) {
      throw new Error('Eip1193Bridge is experimental: pass your ethers Provider directly')
    } else {
      ;[connector, hooks] = initializeConnector((actions) => new EIP1193({ actions, provider }))
    }
    connector.activate()
    return { connector, hooks }
  }
  return EMPTY_STATE
}

export let connections: [Connector, Web3ReactHooks][] = []

interface ActiveWeb3ProviderProps {
  jsonRpcEndpoint?: string | JsonRpcProvider
  provider?: Eip1193Provider | JsonRpcProvider
}

export function ActiveWeb3Provider({
  jsonRpcEndpoint,
  provider: propsProvider, // either props.provider or null
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

  connections = [metaMaskConnection, walletConnectConnectionQR, walletConnectConnectionPopup]

  const network = useMemo(() => getNetwork(jsonRpcEndpoint), [jsonRpcEndpoint])
  const activeProvider = useActiveWalletProvider()
  const wallet = useMemo(() => getWallet(propsProvider ?? activeProvider), [propsProvider, activeProvider])

  console.log('jsonrpc endpoint', jsonRpcEndpoint)
  console.log('using wallet activeprovider', activeProvider)
  console.log('using wallet?', wallet !== EMPTY_STATE)
  console.log('wallet', wallet)

  // eslint-disable-next-line prefer-const
  let { connector, hooks } = wallet !== EMPTY_STATE ? wallet : network
  // let { connector, hooks } = wallet.hooks.useIsActive() || network === EMPTY_STATE ? wallet : network
  let accounts = hooks.useAccounts()
  let account = hooks.useAccount()
  let activating = hooks.useIsActivating()
  let active = hooks.useIsActive()
  let chainId = hooks.useChainId()
  console.log('hooks.useAccounts()', hooks.useAccounts())
  console.log('hooks.useAccount()', hooks.useAccount())
  console.log('hooks.useChainId()', hooks.useChainId())
  console.log('hooks.useIsActive()', hooks.useIsActive())

  let library = hooks.useProvider()

  const web3 = useMemo(() => {
    if (connector === EMPTY || !(active || activating)) {
      return EMPTY_WEB3
    }
    return { connector, library, chainId, accounts, account, active, activating }
  }, [account, accounts, activating, active, chainId, connector, library])

  const updateWeb3 = (updateContext: Web3ContextType) => {
    connector = updateContext.connector
    accounts = updateContext.accounts
    account = updateContext.account
    activating = updateContext.activating ?? false
    active = updateContext.active ?? false
    chainId = updateContext.chainId
    library = updateContext.library as Web3Provider
  }

  // Log web3 errors to facilitate debugging.
  // useEffect(() => {
  //   if (error) {
  //     console.error('web3 error:', error)
  //   }
  // }, [error])

  return <Web3Context.Provider value={{ web3, updateWeb3 }}>{children}</Web3Context.Provider>
}

export type Web3Connection = [Connector, Web3ReactHooks]

function toWeb3Connection<T extends Connector>([connector, hooks]: [T, Web3ReactHooks, Web3ReactStore]): [
  T,
  Web3ReactHooks
] {
  return [connector, hooks]
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

export function useActiveWalletProvider(): JsonRpcProvider | Eip1193Provider | undefined {
  const activeWalletProvider = getPriorityConnector(...connections).usePriorityProvider()
  return activeWalletProvider
}

export function useConnect(connection: Web3Connection) {
  const [wallet, hooks] = connection
  const isActive = hooks.useIsActive()
  const accounts = hooks.useAccounts()
  const account = hooks.useAccount()
  const activating = hooks.useIsActivating()
  const chainId = hooks.useChainId()
  const library = hooks.useProvider()
  const updateActiveWeb3ReactCallback = useUpdateActiveWeb3ReactCallback()

  const useWallet = useCallback(() => {
    if (!isActive) {
      console.log('use wallet activating')
      wallet.activate()
    } else {
      // wallet should be already be active
      console.log('wallet is active already')
      const updateContext: Web3ContextType = {
        connector: wallet,
        library,
        accounts,
        account,
        activating,
        active: isActive,
        chainId,
      }
      updateActiveWeb3ReactCallback(updateContext)
    }
  }, [account, accounts, activating, chainId, isActive, library, updateActiveWeb3ReactCallback, wallet])

  return useWallet
}
