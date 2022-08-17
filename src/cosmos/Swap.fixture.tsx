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
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import * as Type from 'theme/type'

import { DAI, USDC_MAINNET } from '../constants/tokens'
import useOption from './useOption'
import useProvider, { INFURA_NETWORK_URLS } from './useProvider'

const EventFeedWrapper = styled.div`
  background-color: ${defaultTheme.container};
  border-radius: ${defaultTheme.borderRadius}em;
  box-sizing: border-box;
  font-family: ${defaultTheme.fontFamily.font};
  padding: 1em;
  width: 360px;
`
const EventData = styled.div`
  height: 80vh;
  overflow: auto;
`
const EventJSON = styled.pre`
  margin-top: 1em;
`
const EventRow = styled.div`
  background-color: ${defaultTheme.module};
  border-radius: ${defaultTheme.borderRadius / 2}em;
  margin: 1em 0;
  padding: 0.2em;
`
const Message = styled.pre`
  margin: 0;
`
interface HandlerEventMessage {
  message: string
  data: Record<string, any>
}

function Fixture() {
  const [events, setEvents] = useState<HandlerEventMessage[]>([])
  const addEvent = useCallback(
    (event: HandlerEventMessage) => {
      setEvents(events.concat(event))
    },
    [events]
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

  const [hideConnectionUI] = useValue('hideConnectionUI', { defaultValue: false })

  const [width] = useValue('width', { defaultValue: 360 })

  const locales = [...SUPPORTED_LOCALES, 'fa-KE (unsupported)', 'pseudo']
  const locale = useOption('locale', { options: locales, defaultValue: DEFAULT_LOCALE, nullable: false })

  const [theme, setTheme] = useValue('theme', { defaultValue: { ...defaultTheme } })
  const [darkMode] = useValue('darkMode', { defaultValue: false })
  useEffect(() => setTheme((theme) => ({ ...theme, ...(darkMode ? darkTheme : lightTheme) })), [darkMode, setTheme])

  const jsonRpcUrlMap = INFURA_NETWORK_URLS

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

  return (
    <Row align="start" justify="space-around">
      <SwapWidget
        convenienceFee={convenienceFee}
        convenienceFeeRecipient={convenienceFeeRecipient}
        defaultInputTokenAddress={defaultInputToken}
        defaultInputAmount={defaultInputAmount}
        defaultOutputTokenAddress={defaultOutputToken}
        defaultOutputAmount={defaultOutputAmount}
        hideConnectionUI={hideConnectionUI}
        locale={locale}
        jsonRpcUrlMap={jsonRpcUrlMap}
        defaultChainId={defaultChainId}
        provider={connector}
        theme={theme}
        tokenList={tokenList}
        width={width}
        routerUrl={routerUrl}
        onConnectWalletClick={() => addEvent({ message: 'onConnectWalletClick', data: {} })}
        onReviewSwapClick={() => addEvent({ message: 'onReviewSwapClick', data: {} })}
        onTokenSelectorClick={(f: Field) => addEvent({ message: `onTokenSelectorClick`, data: { field: f } })}
        onTxSubmit={(_txHash: string, data: any) => addEvent({ message: `onTxSubmit`, data })}
        onTxSuccess={(_txHash: string, data: any) => addEvent({ message: `onTxSuccess`, data })}
        onTxFail={(error: Error) => addEvent({ message: `onTxFail`, data: error })}
      />
      <EventFeedWrapper>
        <Type.H2>Event Feed</Type.H2>
        <button onClick={() => setEvents([])} disabled={events.length === 0}>
          clear
        </button>
        <EventData>
          {events?.map(({ message, data }, i) => (
            <EventRow key={i}>
              <div>
                <Type.H3 padding={0}>
                  <Message>{message}</Message>
                </Type.H3>
                <EventJSON>{JSON.stringify(data, null, 2)}</EventJSON>
              </div>
            </EventRow>
          ))}
        </EventData>
      </EventFeedWrapper>
    </Row>
  )
}

export default <Fixture />
