import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { BottomSheetModal } from 'components/BottomSheetModal'
import Column from 'components/Column'
import Popover from 'components/Popover'
import Row from 'components/Row'
import { useTooltip } from 'components/Tooltip'
import { useIsMobileWidth } from 'hooks/useIsMobileWidth'
import { useIsWideWidget } from 'hooks/useWidgetWidth'
import { Gas } from 'icons'
import { useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { ThemedText } from 'theme'

import RoutingDiagram from '../RoutingDiagram'

export interface TradeTooltip {
  trade?: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
}

/**
 * Renders a Gas Icon and estimated gas cost in USD.
 *
 * On mobile widths, clicking the view opens a bottom sheet with the routing diagram.
 * On larger widths, hovering or focusing the view shows a popover with the routing diagram.
 */
export function GasEstimateTooltip({ gasUseEstimateUSD, trade }: TradeTooltip) {
  const isWide = useIsWideWidget()
  const isMobile = useIsMobileWidth()
  const [tooltip, setTooltip] = useState<HTMLDivElement | null>(null)
  const showTooltip = useTooltip(tooltip)
  const [open, setOpen] = useState(false)
  const displayEstimate = formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)
  return isMobile ? (
    <>
      <Row
        gap={0.25}
        onClick={(e) => {
          setOpen((open) => !open)
          e.stopPropagation()
        }}
      >
        <Gas color="secondary" />
        {isWide && <ThemedText.Body2 color="secondary">{displayEstimate}</ThemedText.Body2>}
      </Row>
      <BottomSheetModal title="Route details" onClose={() => setOpen(false)} open={Boolean(trade) && open}>
        {trade && (
          <Column padded>
            <RoutingDiagram trade={trade} hideHeader gasUseEstimateUSD={gasUseEstimateUSD} />
          </Column>
        )}
      </BottomSheetModal>
    </>
  ) : (
    <Popover
      content={trade ? <RoutingDiagram trade={trade} gasUseEstimateUSD={gasUseEstimateUSD} /> : null}
      placement="bottom"
      show={Boolean(trade) && showTooltip}
    >
      <Row ref={setTooltip} gap={0.25}>
        <Gas color="secondary" />
        {isWide && <ThemedText.Body2 color="secondary">{displayEstimate}</ThemedText.Body2>}
      </Row>
    </Popover>
  )
}
