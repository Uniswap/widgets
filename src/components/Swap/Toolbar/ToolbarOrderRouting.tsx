import { Trans } from '@lingui/macro'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
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
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
}

export default function ToolbarOrderRouting({ trade, gasUseEstimateUSD }: ToolbarOrderRoutingProps) {
  return (
    <OrderRoutingRow>
      <Row gap={0.25}>
        <ThemedText.Body2 color="secondary">
          <Trans>Order routing</Trans>
        </ThemedText.Body2>
        {trade && (
          <Tooltip icon={Info}>
            <RoutingDiagram trade={trade} gasUseEstimateUSD={gasUseEstimateUSD} />
          </Tooltip>
        )}
      </Row>
      <AutoRouterHeader />
    </OrderRoutingRow>
  )
}
