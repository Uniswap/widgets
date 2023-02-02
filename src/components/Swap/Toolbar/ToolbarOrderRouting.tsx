import { Trans } from '@lingui/macro'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { BottomSheetModal } from 'components/BottomSheetModal'
import Column from 'components/Column'
import Popover from 'components/Popover'
import Row from 'components/Row'
import { useTooltip } from 'components/Tooltip'
import { useIsMobileWidth } from 'hooks/useIsMobileWidth'
import { useState } from 'react'
import { WidoTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { Body2LineHeightRem } from 'theme/type'

import { AutoRouterHeader } from '../RoutingDiagram'

const CONTAINER_VERTICAL_PADDING_EM = 1
export const ORDER_ROUTING_HEIGHT_EM = CONTAINER_VERTICAL_PADDING_EM * 2 + Body2LineHeightRem /* Body2 line height */

const OrderRoutingRow = styled(Row)`
  height: ${ORDER_ROUTING_HEIGHT_EM}em;
  margin: 0 1em;
  padding: ${CONTAINER_VERTICAL_PADDING_EM}em 0;
`

interface ToolbarOrderRoutingProps {
  trade?: WidoTrade
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
                Hey
                {/* <RoutingDiagram trade={trade} hideHeader /> */}
              </Column>
            </BottomSheetModal>
          </Row>
        ) : (
          <Popover
            content={
              trade
                ? // <RoutingDiagram gasUseEstimateUSD={gasUseEstimateUSD} trade={trade} />
                  'hey there'
                : null
            }
            show={Boolean(trade) && showTooltip}
            placement="auto"
          >
            <AutoRouterHeader ref={setTooltip} />
          </Popover>
        ))}
    </OrderRoutingRow>
  )
}
