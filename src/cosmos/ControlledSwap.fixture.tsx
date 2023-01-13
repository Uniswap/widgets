import { tokens } from '@uniswap/default-token-list'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { Field, SupportedChainId, SwapWidget } from '@uniswap/widgets'
import Row from 'components/Row'
import { useCallback, useMemo, useState } from 'react'

import { nativeOnChain, USDC } from '../constants/tokens'
import EventFeed, { Event, HANDLERS } from './EventFeed'
import useOption from './useOption'
import useProvider from './useProvider'

function Fixture() {
  const [events, setEvents] = useState<Event[]>([])
  const useHandleEvent = useCallback(
    (name: string) =>
      (...data: unknown[]) =>
        setEvents((events) => [{ name, data }, ...events]),
    []
  )

  const currencies: Record<string, Currency> = useMemo(
    () => ({
      // Include native token from each chain
      ...Object.values(SupportedChainId)
        .filter((id): id is number => Number.isInteger(id))
        .reduce(
          (eth, chainId) => ({
            ...eth,
            [SupportedChainId[chainId]]: nativeOnChain(chainId),
          }),
          {}
        ),
      // Include USDC from each chain
      ...Object.values(USDC).reduce(
        (usdc, chainUsdc) => ({
          ...usdc,
          [`${SupportedChainId[chainUsdc.chainId]} USDC`]: chainUsdc,
        }),
        {}
      ),
    }),
    []
  )
  const inputToken = useOption('input', {
    options: currencies,
    defaultValue: SupportedChainId[SupportedChainId.MAINNET],
  })
  const outputToken = useOption('output', {
    options: currencies,
    defaultValue: `${SupportedChainId[SupportedChainId.MAINNET]} USDC`,
  })

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
    (...data: [Field, string]) => {
      const [field, amount] = data
      setType(field === Field.INPUT ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT)
      setAmount(amount)
      handleAmountChange(...data)
    },
    [handleAmountChange]
  )

  const value = useMemo(
    () => ({
      type,
      amount,
      [Field.INPUT]: inputToken,
      [Field.OUTPUT]: outputToken,
    }),
    [amount, inputToken, outputToken, type]
  )

  return (
    <Row flex align="start" justify="start" gap={0.5}>
      <SwapWidget
        permit2
        value={value}
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
