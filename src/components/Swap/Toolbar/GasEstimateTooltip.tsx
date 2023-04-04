import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import Popover from 'components/Popover'
import { ExpandedRouteBreakdown } from 'components/RouteBreakdown'
import Row from 'components/Row'
import { useTooltip } from 'components/Tooltip'
import { useChainTokenMapContext } from 'hooks/useTokenList'
import { Gas } from 'icons'
import { useState } from 'react'
import { WidoTrade } from 'state/routing/types'
import { ThemedText } from 'theme'

// import RoutingDiagram from '../RoutingDiagram'

export interface TradeTooltip {
  trade?: WidoTrade
  gasUseEstimate?: CurrencyAmount<Token> | null
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
}

/**
 * Renders a Gas Icon and estimated gas cost in USD.
 *
 * On larger widths, hovering or focusing the view shows a popover with the routing diagram.
 */
export function GasEstimateTooltip({ gasUseEstimate, gasUseEstimateUSD, trade }: TradeTooltip) {
  const [tooltip, setTooltip] = useState<HTMLDivElement | null>(null)
  const showTooltip = useTooltip(tooltip)
  const displayEstimateUsd = formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)
  const displayEstimate = formatCurrencyAmount(gasUseEstimate, NumberType.TokenTx)
  const chainTokenMap = useChainTokenMapContext()

  return (
    <Popover
      content={trade ? <ExpandedRouteBreakdown steps={trade.steps} chainTokenMap={chainTokenMap} /> : null}
      placement="bottom"
      show={Boolean(trade) && showTooltip}
      offset={12}
    >
      <Row ref={setTooltip} gap={0.25}>
        <Gas color="secondary" />
        <ThemedText.Body2 color="secondary">
          {gasUseEstimateUSD ? displayEstimateUsd : `${displayEstimate} ${gasUseEstimate?.currency.symbol}`}
        </ThemedText.Body2>
      </Row>
    </Popover>
  )
}
