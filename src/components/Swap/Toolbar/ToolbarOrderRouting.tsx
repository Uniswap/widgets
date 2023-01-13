import { Trans } from '@lingui/macro'
import Row from 'components/Row'
import Tooltip from 'components/Tooltip'
import { Info } from 'icons'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import RoutingDiagram, { AutoRouterHeader } from '../RoutingDiagram'

const OrderRoutingRow = styled(Row)`
  justify-content: space-between;
  margin: 0.75em 1em;
`

interface ToolbarOrderRoutingProps {
  trade?: InterfaceTrade
}

export default function ToolbarOrderRouting({ trade }: ToolbarOrderRoutingProps) {
  return (
    <OrderRoutingRow>
      <Row gap={0.25}>
        <ThemedText.Body2 color="secondary">
          <Trans>Order routing</Trans>
        </ThemedText.Body2>
        {trade && (
          <Tooltip icon={Info}>
            <RoutingDiagram trade={trade} />
          </Tooltip>
        )}
      </Row>
      <AutoRouterHeader />
    </OrderRoutingRow>
  )
}
