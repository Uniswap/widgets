import { ExternalProvider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'
import { EMPTY } from '@web3-react/empty'
import { Connector, Provider as Eip1193Provider } from '@web3-react/types'
import { Url } from '@web3-react/url'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
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
export const Web3Context = createContext(EMPTY_CONTEXT)

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

interface ActiveWeb3ProviderProps {
  jsonRpcEndpoint?: string | JsonRpcProvider
  provider?: Eip1193Provider | JsonRpcProvider
}

export function ActiveWeb3Provider({
  jsonRpcEndpoint,
  provider,
  children,
}: PropsWithChildren<ActiveWeb3ProviderProps>) {
  const network = useMemo(() => getNetwork(jsonRpcEndpoint), [jsonRpcEndpoint])
  const wallet = useMemo(() => getWallet(provider), [provider])

  // eslint-disable-next-line prefer-const
  let { connector, hooks } = wallet.hooks.useIsActive() || network === EMPTY_STATE ? wallet : network
  let accounts = hooks.useAccounts()
  let account = hooks.useAccount()
  let activating = hooks.useIsActivating()
  let active = hooks.useIsActive()
  let chainId = hooks.useChainId()
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
