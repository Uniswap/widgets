import { tokens } from '@uniswap/default-token-list'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { SupportedChainId, SwapWidget } from '@uniswap/widgets'
import Row from 'components/Row'
import { useCallback, useState } from 'react'
import { useValue } from 'react-cosmos/fixture'

import { DAI, nativeOnChain, USDC_MAINNET } from '../constants/tokens'
import EventFeed, { Event } from './EventFeed'
import useOption from './useOption'
import useProvider, { INFURA_NETWORK_URLS } from './useProvider'

function Fixture() {
  const [events, setEvents] = useState<Event[]>([])
  const useHandleEvent = useCallback(
    (name: string) =>
      (...data: unknown[]) =>
        setEvents((events) => [...events, { name, data }]),
    []
  )

  const tradeType = useOption('tradeType', {
    nullable: false,
    defaultValue: 'Exact Input',
    options: {
      'Exact Input': TradeType.EXACT_INPUT,
      'Exact Output': TradeType.EXACT_OUTPUT,
    },
  })
  const [amount] = useValue('amount', { defaultValue: '0' })
  const currencies: Record<string, Currency> = {
    ETH: nativeOnChain(SupportedChainId.MAINNET),
    DAI,
    USDC: USDC_MAINNET,
  }
  const inputToken = useOption('input', { options: currencies })
  const outputToken = useOption('output', { options: currencies })

  const connector = useProvider(SupportedChainId.MAINNET)

  return (
    <Row align="start" justify="space-around">
      <SwapWidget
        type={tradeType}
        amount={amount}
        inputToken={inputToken}
        outputToken={outputToken}
        onTokenChange={useHandleEvent('onTokenChange')}
        onAmountChange={useHandleEvent('onAmountChange')}
        onSwitchTokens={useHandleEvent('onSwitchTokens')}
        hideConnectionUI={true}
        jsonRpcUrlMap={INFURA_NETWORK_URLS}
        provider={connector}
        tokenList={tokens}
        onConnectWalletClick={useHandleEvent('onConnectWalletClick')}
        onReviewSwapClick={useHandleEvent('onReviewSwapClick')}
        onTokenSelectorClick={useHandleEvent('onTokenSelectorClick')}
        onTxSubmit={useHandleEvent('onTxSubmit')}
        onTxSuccess={useHandleEvent('onTxSuccess')}
        onTxFail={useHandleEvent('onTxFail')}
      />
      <EventFeed events={events} onClear={() => setEvents([])} />
    </Row>
  )
}

export default <Fixture />
