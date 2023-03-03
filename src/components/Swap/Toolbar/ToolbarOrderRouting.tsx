import { Trans } from '@lingui/macro'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { BottomSheetModal } from 'components/BottomSheetModal'
import Column from 'components/Column'
import Popover from 'components/Popover'
import Row from 'components/Row'
import { useTooltip } from 'components/Tooltip'
import { useIsMobileWidth } from 'hooks/useIsMobileWidth'
import { useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { Body2LineHeightRem } from 'theme/type'

import RoutingDiagram, { AutoRouterHeader } from '../RoutingDiagram'

const CONTAINER_VERTICAL_PADDING_REM = 1
export const ORDER_ROUTING_HEIGHT_REM = CONTAINER_VERTICAL_PADDING_REM * 2 + Body2LineHeightRem /* Body2 line height */

const OrderRoutingRow = styled(Row)`
  height: ${ORDER_ROUTING_HEIGHT_REM}rem;
  margin: 0 1rem;
  padding: ${CONTAINER_VERTICAL_PADDING_REM}rem 0;
`

interface ToolbarOrderRoutingProps {
  trade?: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
}

export default function ToolbarOrderRouting({ trade, gasUseEstimateUSD }: ToolbarOrderRoutingProps) {
  const isMobile = useIsMobileWidth()
  const [open, setOpen] = useState(false)
  const [tooltip, setTooltip] = useState<HTMLDivElement | null>(null)
  const showTooltip = useTooltip(tooltip)
  return (
    <OrderRoutingRow flex>
      <ThemedText.Body2 color="secondary">
        <Trans>Order routing</Trans>
      </ThemedText.Body2>
      {trade &&
        (isMobile ? (
          <Row>
            <AutoRouterHeader ref={setTooltip} onClick={() => setOpen(true)} />
            <BottomSheetModal title="Route details" onClose={() => setOpen(false)} open={open}>
              <Column padded>
                <RoutingDiagram trade={trade} hideHeader />
              </Column>
            </BottomSheetModal>
          </Row>
        ) : (
          <Popover
            content={trade ? <RoutingDiagram gasUseEstimateUSD={gasUseEstimateUSD} trade={trade} /> : null}
            show={Boolean(trade) && showTooltip}
            placement="auto"
          >
            <AutoRouterHeader ref={setTooltip} />
          </Popover>
        ))}
    </OrderRoutingRow>
  )
}
