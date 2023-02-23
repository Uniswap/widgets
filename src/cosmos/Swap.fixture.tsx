import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React, Web3ReactProvider } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import Column from 'components/Column'
import Row from 'components/Row'
import { connect, disconnect, IStarknetWindowObject } from 'get-starknet'
// import { ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useValue } from 'react-cosmos/fixture'
import { darkTheme, defaultTheme, lightTheme, SwapWidget } from 'wido-widget'

import EventFeed, { Event, HANDLERS } from './EventFeed'

function Fixture() {
  const [events, setEvents] = useState<Event[]>([])
  const useHandleEvent = useCallback(
    (name: string) =>
      (...data: unknown[]) =>
        setEvents((events) => [{ name, data }, ...events]),
    []
  )

  // TODO(zzmp): Changing defaults has no effect if done after the first render.
  // const currencies: Record<string, string> = {
  //   Native: 'NATIVE',
  //   DAI: DAI.address,
  //   USDC: USDC_MAINNET.address,
  // }
  // const defaultInputToken = useOption('defaultInputToken', { options: currencies })
  // const [defaultInputAmount] = useValue('defaultInputAmount', { defaultValue: 0 })
  // const defaultOutputToken = useOption('defaultOutputToken', { options: currencies })
  // const [defaultOutputAmount] = useValue('defaultOutputAmount', { defaultValue: 0 })

  // const [hideConnectionUI] = useValue('hideConnectionUI', { defaultValue: false })

  const [width] = useValue('width', { defaultValue: 420 })

  // const locales = [...SUPPORTED_LOCALES, 'fa-KE (unsupported)', 'pseudo']
  // const locale = useOption('locale', { options: locales, defaultValue: DEFAULT_LOCALE, nullable: false })

  const [theme, setTheme] = useValue('theme', { defaultValue: defaultTheme })
  const [darkMode] = useValue('darkMode', { defaultValue: false })
  useEffect(() => setTheme((theme) => ({ ...theme, ...(darkMode ? darkTheme : lightTheme) })), [darkMode, setTheme])

  const [srcChainIds] = useValue('srcChainIds', {
    defaultValue: '[1,5,137,15367]',
  })
  const [dstChainIds] = useValue('dstChainIds', {
    defaultValue: '[1,137,15367]',
  })

  const [testnetsVisible] = useValue('testnetsVisible', { defaultValue: true })

  const eventHandlers = useMemo(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    () => HANDLERS.reduce((handlers, name) => ({ ...handlers, [name]: useHandleEvent(name) }), {}),
    [useHandleEvent]
  )
  const { library: ethProvider, activate, deactivate } = useWeb3React()

  const handleMetamask = useCallback(async () => {
    if (ethProvider) {
      deactivate()
    } else {
      await activate(injected)
    }
  }, [ethProvider, activate, deactivate])

  const [starknet, setStarknet] = useState<IStarknetWindowObject | undefined>()

  const handleStarknet = useCallback(async () => {
    if (starknet) {
      setStarknet(undefined)
      disconnect()
    } else {
      const connection = await connect()
      await connection?.enable()
      setStarknet(connection)
    }
  }, [starknet, setStarknet])

  // useLocalApi()

  const widget = (
    <SwapWidget
      // defaultInputTokenAddress={defaultInputToken}
      // defaultInputAmount={defaultInputAmount}
      // defaultOutputTokenAddress={defaultOutputToken}
      // defaultOutputAmount={defaultOutputAmount}
      // hideConnectionUI={hideConnectionUI} // TODO(Daniel) remove
      // locale={locale}
      // defaultChainId={defaultChainId} // TODO(Daniel) remove
      // provider={connector} // TODO(Daniel) remove
      ethProvider={ethProvider}
      snAccount={starknet?.account}
      testnetsVisible={testnetsVisible}
      theme={theme}
      // tokenList={tokenList} // TODO(Daniel) remove
      width={width}
      srcChainIds={JSON.parse(srcChainIds)}
      dstChainIds={JSON.parse(dstChainIds)}
      {...eventHandlers}
    />
  )

  // If framed in a different origin, only display the SwapWidget, without any chrome.
  // This is done to faciliate iframing in the documentation (https://docs.uniswap.org).
  if (!window.frameElement) return widget

  return (
    <Column flex align="start" justify="start" gap={0.5}>
      <Row flex align="start" justify="start" gap={0.5}>
        {widget}
        <EventFeed events={events} onClear={() => setEvents([])} />
      </Row>
      <button onClick={handleMetamask}>{ethProvider ? 'Disconnect' : 'Connect'} ethereum wallet</button>
      <button onClick={handleStarknet}>{starknet ? 'Disconnect' : 'Connect'} starknet wallet</button>
      Starknet Address: {starknet?.account?.address}
    </Column>
  )
}

function getLibrary(provider: any) {
  return new Web3Provider(provider) // this will vary according to whether you use e.g. ethers or web3.js
}

export const injected = new InjectedConnector({})

export default function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Fixture />
    </Web3ReactProvider>
  )
}
