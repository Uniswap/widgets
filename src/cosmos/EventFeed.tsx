import { defaultTheme, SwapEventHandlers, TransactionEventHandlers, WidgetEventHandlers } from '@uniswap/widgets'
import Row from 'components/Row'
import { useState } from 'react'
import styled from 'styled-components/macro'
import * as Type from 'theme/type'

const EventFeedWrapper = styled.div`
  background-color: ${defaultTheme.container};
  border-radius: ${defaultTheme.borderRadius.medium}rem;
  box-sizing: border-box;
  font-family: ${defaultTheme.fontFamily.font};
  padding: 1rem;
  width: 360px;
`
const EventColumn = styled.div`
  height: 306px;
  overflow: auto;
`
const EventRow = styled.div`
  background-color: ${defaultTheme.module};
  border-radius: ${defaultTheme.borderRadius.medium / 2}rem;
  margin: 0.5rem 0;
  padding: 0.2rem 0.2rem 0.5rem;
`
const EventData = styled.pre`
  margin: 0.5rem 0 0;
`

export const HANDLERS: (keyof SwapEventHandlers | keyof TransactionEventHandlers | keyof WidgetEventHandlers)[] = [
  'onAmountChange',
  'onConnectWalletClick',
  'onError',
  'onExpandSwapDetails',
  'onInitialSwapQuote',
  'onPermit2Allowance',
  'onReviewSwapClick',
  'onRouterPreferenceChange',
  'onSettingsReset',
  'onSlippageChange',
  'onSubmitSwapClick',
  'onSwapApprove',
  'onSwapPriceUpdateAck',
  'onSwapQuote',
  'onSwapSend',
  'onSwitchChain',
  'onSwitchTokens',
  'onTokenAllowance',
  'onTokenChange',
  'onTokenSelectorClick',
  'onTransactionDeadlineChange',
  'onTxFail',
  'onTxSubmit',
  'onTxSuccess',
  'onWrapSend',
]

const SHOW_ALL_EVENTS = '(show all events)'

export interface Event {
  name: string
  data: unknown
}

export interface EventFeedProps {
  events: Event[]
  onClear: () => void
}

export default function EventFeed({ events, onClear }: EventFeedProps) {
  const [selectedEventType, setSelectedEventType] = useState<string>(SHOW_ALL_EVENTS)
  return (
    <EventFeedWrapper>
      <Row>
        <Type.Subhead1>Event Feed</Type.Subhead1>
        <button onClick={onClear}>
          <Type.Subhead1>clear</Type.Subhead1>
        </button>
      </Row>
      <Row>
        <Type.Subhead2>Filter: </Type.Subhead2>
        <select onChange={(e) => setSelectedEventType(e.target.value)} value={selectedEventType}>
          <option>{SHOW_ALL_EVENTS}</option>
          {HANDLERS.map((name) => (
            // Handlers should never have the same name - using key={name} will enforce that at runtime.
            <option key={name}>{name}</option>
          ))}
        </select>
      </Row>
      <EventColumn>
        {events
          ?.filter(({ name }) => (selectedEventType === SHOW_ALL_EVENTS ? true : name === selectedEventType))
          .map(({ name, data }, i) => (
            <EventRow key={i}>
              <Type.Subhead2 margin={0} padding={0}>
                {name}
              </Type.Subhead2>
              <EventData>{JSON.stringify(data, null, 2)}</EventData>
            </EventRow>
          ))}
      </EventColumn>
    </EventFeedWrapper>
  )
}
