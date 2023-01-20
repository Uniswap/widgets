import { defaultTheme, SwapEventHandlers, TransactionEventHandlers, WidgetEventHandlers } from '@uniswap/widgets'
import Row from 'components/Row'
import styled from 'styled-components/macro'
import * as Type from 'theme/type'

const EventFeedWrapper = styled.div`
  background-color: ${defaultTheme.container};
  border-radius: ${defaultTheme.borderRadius.medium}em;
  box-sizing: border-box;
  font-family: ${defaultTheme.fontFamily.font};
  padding: 1em;
  width: 360px;
`
const EventColumn = styled.div`
  height: 306px;
  overflow: auto;
`
const EventRow = styled.div`
  background-color: ${defaultTheme.module};
  border-radius: ${defaultTheme.borderRadius.medium / 2}em;
  margin: 0.5em 0;
  padding: 0.2em 0.2em 0.5em;
`
const EventData = styled.pre`
  margin: 0.5em 0 0;
`

export const HANDLERS: (keyof SwapEventHandlers | keyof TransactionEventHandlers | keyof WidgetEventHandlers)[] = [
  'onAmountChange',
  'onConnectWalletClick',
  'onError',
  'onExpandSwapDetails',
  'onInitialSwapQuote',
  'onSwapApprove',
  'onReviewSwapClick',
  'onSettingsReset',
  'onSlippageChange',
  'onSubmitSwapClick',
  'onSwapPriceUpdateAck',
  'onSwitchChain',
  'onSwitchTokens',
  'onTokenChange',
  'onTokenSelectorClick',
  'onTransactionDeadlineChange',
  'onTxFail',
  'onTxSubmit',
  'onTxSuccess',
]

export interface Event {
  name: string
  data: unknown
}

export interface EventFeedProps {
  events: Event[]
  onClear: () => void
}

export default function EventFeed({ events, onClear }: EventFeedProps) {
  return (
    <EventFeedWrapper>
      <Row>
        <Type.Subhead1>Event Feed</Type.Subhead1>
        <button onClick={onClear}>
          <Type.Subhead1>clear</Type.Subhead1>
        </button>
      </Row>
      <EventColumn>
        {events?.map(({ name, data }, i) => (
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
