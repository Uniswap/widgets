import { tokens } from '@uniswap/default-token-list'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { Field, SupportedChainId, SwapWidget } from '@uniswap/widgets'
import Row from 'components/Row'
import { useCallback, useMemo, useState } from 'react'

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

  const eventHandlers = useMemo(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    () => HANDLERS.reduce((handlers, name) => ({ ...handlers, [name]: useHandleEvent(name) }), {}),
    [useHandleEvent]
  )

  const [type, setType] = useState(TradeType.EXACT_INPUT)
  const [amount, setAmount] = useState('')
  const handleAmountChange = useHandleEvent('onAmountChange')
  const onAmountChange = useCallback(
    (...data) => {
      const [field, amount] = data
      setType(field === Field.INPUT ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT)
      setAmount(amount)
      handleAmountChange(...data)
    },
    [handleAmountChange]
  )

  return (
    <Row flex align="start" justify="start" gap={0.5}>
      <SwapWidget
        value={{
          type,
          amount,
          [Field.INPUT]: inputToken,
          [Field.OUTPUT]: outputToken,
        }}
        jsonRpcUrlMap={INFURA_NETWORK_URLS}
        provider={connector}
        tokenList={tokens}
        {...eventHandlers}
        onAmountChange={onAmountChange}
      />
      <EventFeed events={events} onClear={() => setEvents([])} />
    </Row>
  )
}

export default <Fixture />
