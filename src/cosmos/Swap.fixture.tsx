import { Web3Provider } from '@ethersproject/providers'
import { darkTheme, defaultTheme, lightTheme, SwapWidget } from '@uniswap/widgets'
import Row from 'components/Row'
// import { ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useValue } from 'react-cosmos/fixture'

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

  // const defaultNetwork = useOption('defaultChainId', {
  //   options: Object.keys(CHAIN_NAMES_TO_IDS),
  //   defaultValue: 'mainnet',
  // })
  // const defaultChainId = defaultNetwork ? CHAIN_NAMES_TO_IDS[defaultNetwork] : undefined

  const [testnetsVisible] = useValue('testnetsVisible', { defaultValue: false })

  const eventHandlers = useMemo(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    () => HANDLERS.reduce((handlers, name) => ({ ...handlers, [name]: useHandleEvent(name) }), {}),
    [useHandleEvent]
  )
  const [ethProvider, setEthProvider] = useState<Web3Provider | undefined>()

  const handleMetamask = useCallback(() => {
    if (ethProvider) {
      setEthProvider(undefined)
    } else {
      setEthProvider(new Web3Provider(window.ethereum as any))
    }
  }, [ethProvider, setEthProvider])

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
      testnetsVisible={testnetsVisible}
      theme={theme}
      // tokenList={tokenList} // TODO(Daniel) remove
      width={width}
      {...eventHandlers}
    />
  )

  // If framed in a different origin, only display the SwapWidget, without any chrome.
  // This is done to faciliate iframing in the documentation (https://docs.uniswap.org).
  if (!window.frameElement) return widget

  return (
    <Row flex align="start" justify="start" gap={0.5}>
      {widget}
      <EventFeed events={events} onClear={() => setEvents([])} />
      <button onClick={handleMetamask}>{ethProvider ? 'Disconnect' : 'Connect'} Metamask</button>
      <button>Connect ArgentX</button>
    </Row>
  )
}

export default <Fixture />
