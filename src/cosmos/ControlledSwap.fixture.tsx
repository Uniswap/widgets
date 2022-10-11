import { tokens } from '@uniswap/default-token-list'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { Field, SupportedChainId, SwapWidget } from '@uniswap/widgets'
import Row from 'components/Row'
import { useCallback, useState } from 'react'
import { useValue } from 'react-cosmos/fixture'

import { DAI, nativeOnChain, USDC } from '../constants/tokens'
import EventFeed, { Event, HANDLERS } from './EventFeed'
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
    // Include USDC from each chain
    ...Object.values(USDC).reduce(
      (usdc, chainUsdc) => ({
        ...usdc,
        [`${SupportedChainId[chainUsdc.chainId]} USDC`]: chainUsdc,
      }),
      {}
    ),
  }
  const inputToken = useOption('input', { options: currencies })
  const outputToken = useOption('output', { options: currencies })

  const connector = useProvider(SupportedChainId.MAINNET)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const eventHandlers = HANDLERS.reduce((handlers, name) => ({ ...handlers, [name]: useHandleEvent(name) }), {})

  return (
    <Row flex align="start" justify="start" gap={0.5}>
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
        jsonRpcUrlMap={INFURA_NETWORK_URLS}
        provider={connector}
        tokenList={tokens}
        {...eventHandlers}
      />
      <EventFeed events={events} onClear={() => setEvents([])} />
    </Row>
  )
}

export default <Fixture />
