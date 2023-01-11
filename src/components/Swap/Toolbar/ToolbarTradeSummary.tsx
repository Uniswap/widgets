import { t } from '@lingui/macro'
import { formatCurrencyAmount, formatPriceImpact, NumberType } from '@uniswap/conedison/format'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import Column from 'components/Column'
import Row from 'components/Row'
import Tooltip from 'components/Tooltip'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { AlertTriangle, Icon, Info } from 'icons'
import { ReactNode } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { Color, ThemedText } from 'theme'

import { Estimate } from '../Summary'
import { PriceImpactWarningTooltipContent } from './Caption'

const TradeSummaryColumn = styled(Column)`
  border-bottom: 1px solid ${({ theme }) => theme.outline};
  border-top: 1px solid ${({ theme }) => theme.outline};
  margin: 0 1em;
  padding: 0.75em 0;
`

const TradeAttributeName = styled(ThemedText.Body2)`
  color: ${({ theme, color }) => color ?? theme.secondary};
`

const TradeAttributeValue = styled(ThemedText.Body2)`
  color: ${({ theme, color }) => color ?? theme.primary};
`

interface SummaryRowProps {
  name: string
  value: string
  color?: Color
  tooltip?: {
    side: 'name' | 'value'
    content: ReactNode
    icon: Icon
  }
}

function SummaryRow({ name, value, color, tooltip }: SummaryRowProps) {
  return (
    <Row>
      {tooltip?.side === 'name' ? (
        <Row gap={0.25}>
          <TradeAttributeName color={color}>{name}</TradeAttributeName>
          <Tooltip icon={tooltip.icon} iconProps={{ color }}>
            {tooltip.content}
          </Tooltip>
        </Row>
      ) : (
        <TradeAttributeName color={color}>{name}</TradeAttributeName>
      )}
      {tooltip?.side === 'value' ? (
        <Row gap={0.25}>
          <Tooltip icon={tooltip.icon} iconProps={{ color }}>
            {tooltip.content}
          </Tooltip>
          <TradeAttributeValue color={color}>{value}</TradeAttributeValue>
        </Row>
      ) : (
        <TradeAttributeValue color={color}>{value}</TradeAttributeValue>
      )}
    </Row>
  )
}

interface ToolbarTradeSummaryProps {
  trade?: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token>
  impact?: PriceImpact
  slippage: Slippage
}

export default function ToolbarTradeSummary({ gasUseEstimateUSD, impact, trade, slippage }: ToolbarTradeSummaryProps) {
  const currencySymbol = trade?.outputAmount?.currency?.symbol ?? ''
  return (
    <TradeSummaryColumn gap={0.75}>
      <SummaryRow
        name={t`Network fee`}
        value={(gasUseEstimateUSD ? '~' : '') + formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)}
      />
      <SummaryRow
        color={impact?.warning}
        name={t`Price impact`}
        value={formatPriceImpact(impact?.percent)}
        tooltip={
          impact?.warning
            ? {
                icon: AlertTriangle,
                content: <PriceImpactWarningTooltipContent />,
                side: 'value',
              }
            : undefined
        }
      />
      <SummaryRow
        name={t`Minimum output after slippage`}
        value={`${formatCurrencyAmount(trade?.minimumAmountOut(slippage.allowed))} ${currencySymbol}`}
      />
      <SummaryRow
        name={t`Expected output`}
        value={`${formatCurrencyAmount(trade?.outputAmount)} ${currencySymbol}`}
        tooltip={
          trade
            ? {
                icon: Info,
                content: <Estimate trade={trade} slippage={slippage} />,
                side: 'name',
              }
            : undefined
        }
      />
    </TradeSummaryColumn>
  )
}
