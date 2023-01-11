import { Plural, t, Trans } from '@lingui/macro'
import Row from 'components/Row'
import Tooltip from 'components/Tooltip'
import { Info } from 'icons'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import RoutingDiagram from '../RoutingDiagram'

const OrderRoutingRow = styled(Row)`
  justify-content: space-between;
  margin: 0.75em 1em;
`

interface ToolbarOrderRoutingProps {
  trade?: InterfaceTrade
}

export default function ToolbarOrderRouting({ trade }: ToolbarOrderRoutingProps) {
  const hopCount = trade?.routes?.reduce((acc, curr) => acc + (curr?.pools?.length ?? 0), 0)
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
      <ThemedText.Body2 color="primary">
        <Plural value={hopCount ?? 1} _1={t`1 hop`} other={t`${hopCount} hops`} />
      </ThemedText.Body2>
    </OrderRoutingRow>
  )
}
