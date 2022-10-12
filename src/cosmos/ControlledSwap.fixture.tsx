import { tokens } from '@uniswap/default-token-list'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { Field, SupportedChainId, SwapWidget } from '@uniswap/widgets'
import Row from 'components/Row'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useValue } from 'react-cosmos/fixture'
import { chain, useAccount, useConnect, useProvider, useSigner, WagmiConfig } from 'wagmi'
import { configureChains, createClient } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { publicProvider } from 'wagmi/providers/public'

import { DAI, nativeOnChain, USDC } from '../constants/tokens'
import EventFeed, { Event, HANDLERS } from './EventFeed'
import useOption from './useOption'
// import useProvider, { INFURA_NETWORK_URLS } from './useProvider'
import { INFURA_NETWORK_URLS } from './useProvider'

const { chains, provider, webSocketProvider } = configureChains([chain.mainnet, chain.polygon], [publicProvider()])

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
})

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

  // const connector = useProvider(SupportedChainId.MAINNET)

  const eventHandlers = useMemo(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    () => HANDLERS.reduce((handlers, name) => ({ ...handlers, [name]: useHandleEvent(name) }), {}),
    [useHandleEvent]
  )

  // connect

  const { connect, isLoading } = useConnect({
    connector: new InjectedConnector(),
  })
  const { address, isConnected } = useAccount()
  const provider = useProvider()
  const { data, isLoading: signerLoading } = useSigner()

  useEffect(() => {
    if (!window) return

    if (!isConnected) {
      connect()
    }
  }, [isConnected])

  if (isLoading || signerLoading || !provider || !data) return <></>

  return (
    <Row flex align="start" justify="start" gap={0.5}>
      <SwapWidget
        value={{
          type,
          amount,
          [Field.INPUT]: inputToken,
          [Field.OUTPUT]: outputToken,
        }}
        // onSettingsReset={useHandleEvent('onSettingsReset')}
        // onSlippageChange={useHandleEvent('onSlippageChange')}
        // onTransactionDeadlineChange={useHandleEvent('onTransactionDeadlineChange')}
        // onTokenChange={useHandleEvent('onTokenChange')}
        // onAmountChange={useHandleEvent('onAmountChange')}
        // onSwitchTokens={useHandleEvent('onSwitchTokens')}
        jsonRpcUrlMap={INFURA_NETWORK_URLS}
        tokenList={tokens}
        provider={provider}
        signer={data}
        address={`${address}`}
        account={`${address}`}
        isActive
        {...eventHandlers}
      />
      <EventFeed events={events} onClear={() => setEvents([])} />
    </Row>
  )
}

export default (
  <WagmiConfig client={client}>
    <Fixture />
  </WagmiConfig>
)
