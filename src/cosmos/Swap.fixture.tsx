import { tokens } from '@uniswap/default-token-list'
import { TokenInfo } from '@uniswap/token-lists'
import {
  darkTheme,
  DEFAULT_LOCALE,
  defaultTheme,
  lightTheme,
  SUPPORTED_LOCALES,
  SupportedChainId,
  SwapWidget,
} from '@uniswap/widgets'
import Row from 'components/Row'
import { CHAIN_NAMES_TO_IDS } from 'constants/chains'
import { useCallback, useEffect, useState } from 'react'
import { useValue } from 'react-cosmos/fixture'

import { DAI, USDC_MAINNET } from '../constants/tokens'
import EventFeed, { Event } from './EventFeed'
import useOption from './useOption'
import useProvider, { INFURA_NETWORK_URLS } from './useProvider'

function Fixture() {
  const [events, setEvents] = useState<Event[]>([])
  const useHandleEvent = useCallback(
    (name: string) =>
      (...data: unknown[]) =>
        setEvents((events) => [{ name, data }, ...events]),
    []
  )

  const [convenienceFee] = useValue('convenienceFee', { defaultValue: 0 })
  const convenienceFeeRecipient = useOption('convenienceFeeRecipient', {
    options: [
      '0x1D9Cd50Dde9C19073B81303b3d930444d11552f7',
      '0x0dA5533d5a9aA08c1792Ef2B6a7444E149cCB0AD',
      '0xE6abE059E5e929fd17bef158902E73f0FEaCD68c',
    ],
  })

  // TODO(zzmp): Changing defaults has no effect if done after the first render.
  const currencies: Record<string, string> = {
    Native: 'NATIVE',
    DAI: DAI.address,
    USDC: USDC_MAINNET.address,
  }
  const defaultInputToken = useOption('defaultInputToken', { options: currencies, defaultValue: 'Native' })
  const [defaultInputAmount] = useValue('defaultInputAmount', { defaultValue: 1 })
  const defaultOutputToken = useOption('defaultOutputToken', { options: currencies })
  const [defaultOutputAmount] = useValue('defaultOutputAmount', { defaultValue: 0 })

  const [disableBranding] = useValue('disableBranding', { defaultValue: false })

  const [hideConnectionUI] = useValue('hideConnectionUI', { defaultValue: false })

  const [width] = useValue('width', { defaultValue: 360 })

  const locales = [...SUPPORTED_LOCALES, 'fa-KE (unsupported)', 'pseudo']
  const locale = useOption('locale', { options: locales, defaultValue: DEFAULT_LOCALE, nullable: false })

  const [theme, setTheme] = useValue('theme', { defaultValue: defaultTheme })
  const [darkMode] = useValue('darkMode', { defaultValue: false })
  useEffect(() => setTheme((theme) => ({ ...theme, ...(darkMode ? darkTheme : lightTheme) })), [darkMode, setTheme])

  const defaultNetwork = useOption('defaultChainId', {
    options: Object.keys(CHAIN_NAMES_TO_IDS),
    defaultValue: 'mainnet',
  })
  const defaultChainId = defaultNetwork ? CHAIN_NAMES_TO_IDS[defaultNetwork] : undefined

  const connector = useProvider(defaultChainId)

  const tokenLists: Record<string, TokenInfo[]> = {
    Default: tokens,
    'Mainnet only': tokens.filter((token) => token.chainId === SupportedChainId.MAINNET),
  }
  const tokenList = useOption('tokenList', { options: tokenLists, defaultValue: 'Default', nullable: false })

  const [routerUrl] = useValue('routerUrl', { defaultValue: 'https://api.uniswap.org/v1/' })

  const widget = (
    <SwapWidget
      convenienceFee={convenienceFee}
      convenienceFeeRecipient={convenienceFeeRecipient}
      defaultInputTokenAddress={defaultInputToken}
      defaultInputAmount={defaultInputAmount}
      defaultOutputTokenAddress={defaultOutputToken}
      defaultOutputAmount={defaultOutputAmount}
      disableBranding={disableBranding}
      hideConnectionUI={hideConnectionUI}
      locale={locale}
      jsonRpcUrlMap={INFURA_NETWORK_URLS}
      defaultChainId={defaultChainId}
      provider={connector}
      theme={theme}
      tokenList={tokenList}
      width={width}
      routerUrl={routerUrl}
      onConnectWalletClick={useHandleEvent('onConnectWalletClick')}
      onReviewSwapClick={useHandleEvent('onReviewSwapClick')}
      onTokenSelectorClick={useHandleEvent('onTokenSelectorClick')}
      onTxSubmit={useHandleEvent('onTxSubmit')}
      onTxSuccess={useHandleEvent('onTxSuccess')}
      onTxFail={useHandleEvent('onTxFail')}
    />
  )

  // If framed in a different origin, only display the SwapWidget, without any chrome.
  // This is done to faciliate iframing in the documentation (https://docs.uniswap.org).
  if (!window.frameElement) return widget

  return (
    <Row align="start" justify="space-around">
      {widget}
      <EventFeed events={events} onClear={() => setEvents([])} />
    </Row>
  )
}

export default <Fixture />
