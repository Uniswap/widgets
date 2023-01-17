import { Trans } from '@lingui/macro'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import Row from 'components/Row'
import Tooltip from 'components/Tooltip'
import { Info } from 'icons'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { Body2LineHeightRem } from 'theme/type'

import RoutingDiagram, { AutoRouterHeader } from '../RoutingDiagram'

const CONTAINER_VERTICAL_PADDING_EM = 1
export const ORDER_ROUTING_HEIGHT_EM = CONTAINER_VERTICAL_PADDING_EM * 2 + Body2LineHeightRem /* Body2 line height */

const OrderRoutingRow = styled(Row)`
  height: ${ORDER_ROUTING_HEIGHT_EM}em;
  justify-content: space-between;
  margin: 0 1em;
  padding: ${CONTAINER_VERTICAL_PADDING_EM}em 0;
`

interface ToolbarOrderRoutingProps {
  trade?: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
}

export default function ToolbarOrderRouting({ trade, gasUseEstimateUSD }: ToolbarOrderRoutingProps) {
  return (
    <OrderRoutingRow flex>
      <Row gap={0.25}>
        <ThemedText.Body2 color="secondary">
          <Trans>Order routing</Trans>
        </ThemedText.Body2>
        {trade && (
          <Tooltip icon={Info} contained>
            <RoutingDiagram trade={trade} gasUseEstimateUSD={gasUseEstimateUSD} />
          </Tooltip>
        )}
      </Row>
      <AutoRouterHeader />
    </OrderRoutingRow>
  )
}
