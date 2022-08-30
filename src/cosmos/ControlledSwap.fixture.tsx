import { tokens } from '@uniswap/default-token-list'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { Field, SupportedChainId, SwapWidget } from '@uniswap/widgets'
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
        setEvents((events) => [{ name, data }, ...events]),
    []
  )

  const type = useOption('type', {
    nullable: false,
    defaultValue: 'Exact Input',
    options: {
      'Exact Input': TradeType.EXACT_INPUT,
      'Exact Output': TradeType.EXACT_OUTPUT,
    },
  }) as TradeType

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
        value={{
          type,
          amount,
          [Field.INPUT]: inputToken,
          [Field.OUTPUT]: outputToken,
        }}
        onSettingsReset={useHandleEvent('onSettingsReset')}
        onSlippageChange={useHandleEvent('onSlippageChange')}
        onTransactionDeadlineChange={useHandleEvent('onTransactionDeadlineChange')}
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
