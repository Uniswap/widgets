import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React, Web3ReactProvider } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import Column from 'components/Column'
import Row from 'components/Row'
import { connect, disconnect, IStarknetWindowObject } from 'get-starknet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useValue } from 'react-cosmos/fixture'
import { useLocalApi, useProdApi } from 'wido'
import { darkTheme, defaultTheme, isStarknetChain, lightTheme, SwapWidget } from 'wido-widget'

import EventFeed, { Event, HANDLERS } from './EventFeed'

function Fixture() {
  const [events, setEvents] = useState<Event[]>([])
  const useHandleEvent = useCallback(
    (name: string) =>
      (...data: unknown[]) =>
        setEvents((events) => [{ name, data }, ...events]),
    []
  )

  const [width] = useValue('width', { defaultValue: 420 })

  // const locales = [...SUPPORTED_LOCALES, 'fa-KE (unsupported)', 'pseudo']
  // const locale = useOption('locale', { options: locales, defaultValue: DEFAULT_LOCALE, nullable: false })

  const [theme, setTheme] = useValue('theme', { defaultValue: defaultTheme })
  const [darkMode] = useValue('darkMode', { defaultValue: false })
  useEffect(() => setTheme((theme) => ({ ...theme, ...(darkMode ? darkTheme : lightTheme) })), [darkMode, setTheme])

  const [srcChainIds] = useValue('srcChainIds', {
    defaultValue: '[1,5,137,15367]',
    // defaultValue: '[5]',
  })
  const [dstChainIds] = useValue('dstChainIds', {
    defaultValue: '[1,137,15367]',
    // defaultValue: '[15367]',
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

  const [localApi] = useValue('localApi', { defaultValue: false })
  if (localApi) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLocalApi()
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useProdApi()
  }

  const [presetFromToken] = useValue('presetFromToken', { defaultValue: false })
  const [presetToToken] = useValue('presetToToken', { defaultValue: false })

  const handleConnectWalletClick = useCallback(
    (chainId: number) => {
      if ('onConnectWalletClick' in eventHandlers) {
        eventHandlers['onConnectWalletClick'](chainId)
      }

      if (isStarknetChain(chainId)) {
        handleStarknet()
      } else {
        handleMetamask()
      }
    },
    [handleStarknet, handleMetamask, eventHandlers]
  )

  const widget = (
    <SwapWidget
      // locale={locale} // TODO
      ethProvider={ethProvider}
      snAccount={starknet?.account}
      testnetsVisible={testnetsVisible}
      theme={theme}
      width={width}
      srcChainIds={JSON.parse(srcChainIds)}
      dstChainIds={JSON.parse(dstChainIds)}
      fromToken={
        presetFromToken
          ? {
              chainId: 5,
              address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            }
          : undefined
      }
      toToken={
        presetToToken
          ? {
              chainId: 15367,
              address: '0x5a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426',
            }
          : undefined
      }
      {...eventHandlers}
      onConnectWalletClick={handleConnectWalletClick}
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
