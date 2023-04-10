import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React, Web3ReactProvider } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import Column from 'components/Column'
import Row from 'components/Row'
import { connect, disconnect, IStarknetWindowObject } from 'get-starknet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useValue } from 'react-cosmos/fixture'
import { getSupportedTokens, quote, useLocalApi, useProdApi } from 'wido'
import { darkTheme, defaultTheme, isStarknetChain, lightTheme, WidoWidget } from 'wido-widget'

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
  const [largeTokenSelect] = useValue('largeTokenSelect', { defaultValue: false })

  useEffect(() => setTheme((theme) => ({ ...theme, ...(darkMode ? darkTheme : lightTheme) })), [darkMode, setTheme])

  const eventHandlers = useMemo(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    () => HANDLERS.reduce((handlers, name) => ({ ...handlers, [name]: useHandleEvent(name) }), {}),
    [useHandleEvent]
  )
  const { library, activate, deactivate, account, chainId } = useWeb3React()

  const [ethProvider, setEthProvider] = useState<Web3Provider | undefined>()

  useEffect(() => {
    if (!library) return
    // every time account or chainId changes we need to re-create the provider
    // for the widget to update with the proper address
    setEthProvider(new Web3Provider(library))
  }, [library, account, chainId, setEthProvider])

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
      connection?.on('networkChanged', () => setStarknet(undefined))
      connection?.on('accountsChanged', () => setStarknet(undefined))
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

  const [presetFromChainIds] = useValue('presetFromChainIds', {
    defaultValue: '[1,5,137,15367,1313161554]',
    // defaultValue: '[5]',
  })
  const [presetToChainIds] = useValue('presetToChainIds', {
    defaultValue: '[1,137,15367,1313161554]',
    // defaultValue: '[15367]',
  })
  const [presetFromToken] = useValue('presetFromToken', { defaultValue: false })
  const [presetToToken] = useValue('presetToToken', { defaultValue: false })
  const [presetToProtocol] = useValue('presetToProtocol', { defaultValue: false })

  const [fromTokens, setFromTokens] = useState<{ chainId: number; address: string }[]>([])
  const [toTokens, setToTokens] = useState<{ chainId: number; address: string }[]>([])

  useEffect(() => {
    if (presetFromToken) {
      setFromTokens([
        {
          chainId: 5,
          address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        },
      ])
    } else {
      getSupportedTokens({
        chainId: JSON.parse(presetFromChainIds),
      }).then(setFromTokens)
    }
  }, [presetFromToken, setFromTokens, presetFromChainIds])

  useEffect(() => {
    if (presetToToken) {
      setToTokens([
        {
          chainId: 15367,
          address: '0x5a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426',
        },
      ])
    } else {
      getSupportedTokens({
        chainId: JSON.parse(presetToChainIds),
        protocol: presetToProtocol ? ['jediswap.xyz' as any] : undefined,
      }).then(setToTokens)
    }
  }, [presetToToken, setToTokens, presetToChainIds, presetToProtocol])

  const handleConnectWalletClick = useCallback(
    (chainId: number) => {
      if ('onConnectWalletClick' in eventHandlers) {
        ;(eventHandlers as any)['onConnectWalletClick'](chainId)
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
    <WidoWidget
      partner="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
      ethProvider={ethProvider}
      snAccount={starknet?.account}
      theme={theme}
      width={width}
      fromTokens={fromTokens}
      toTokens={toTokens}
      quoteApi={(request) => {
        // place to override the quote request or result
        return quote(request)
      }}
      {...eventHandlers}
      onConnectWalletClick={handleConnectWalletClick}
      largeTokenSelect={largeTokenSelect}
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
      <Column flex align="start" justify="start" gap={0.5}>
        <span>Starknet Address: {starknet?.account?.address}</span>
        <span>Starknet ChainId: {starknet?.account?.chainId}</span>
        <span>EVM Address: {account}</span>
        <span>EVM ChainId: {chainId}</span>
      </Column>
    </Column>
  )
}

export const injected = new InjectedConnector({})

export default function App() {
  return (
    <Web3ReactProvider getLibrary={(provider) => provider}>
      <Fixture />
    </Web3ReactProvider>
  )
}
