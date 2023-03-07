import Column from 'components/Column'
import Row from 'components/Row'
import Tooltip from 'components/Tooltip'
import { Icon } from 'icons'
import { ReactNode } from 'react'
import styled from 'styled-components/macro'
import { Color, ThemedText } from 'theme'
import { Body2LineHeightRem } from 'theme/type'

export const SUMMARY_COLUMN_GAP_EM = 0.75
export const SUMMARY_ROW_HEIGHT_EM = Body2LineHeightRem + SUMMARY_COLUMN_GAP_EM

const TradeSummaryColumn = styled(Column)`
  border-bottom: 1px solid ${({ theme }) => theme.outline};
  border-top: 1px solid ${({ theme }) => theme.outline};
  margin: 0 1em;
  padding: ${SUMMARY_COLUMN_GAP_EM}em 0;
`

const TradeAttributeName = styled(ThemedText.Body2)`
  color: ${({ theme, color }) => color ?? theme.secondary};
`

const TradeAttributeValue = styled(ThemedText.Body2)`
  color: ${({ theme, color }) => color ?? theme.primary};
`

export interface SummaryRowProps {
  name: ReactNode
  value: ReactNode
  color?: Color
  nameTooltip?: {
    content: ReactNode
    icon: Icon
  }
  valueTooltip?: {
    content: ReactNode
    icon: Icon
  }
}

function SummaryRow({ name, value, color, nameTooltip, valueTooltip }: SummaryRowProps) {
  return (
    <Row>
      {nameTooltip ? (
        <Row gap={0.25}>
          <TradeAttributeName color={color}>{name}</TradeAttributeName>
          <Tooltip icon={nameTooltip.icon} iconProps={{ color }} placement="auto">
            {nameTooltip.content}
          </Tooltip>
        </Row>
      ) : (
        <TradeAttributeName color={color}>{name}</TradeAttributeName>
      )}
      {valueTooltip ? (
        <Row gap={0.25}>
          <Tooltip icon={valueTooltip.icon} iconProps={{ color }} placement="auto">
            {valueTooltip.content}
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
  rows: SummaryRowProps[]
}

export default function ToolbarTradeSummary({ rows }: ToolbarTradeSummaryProps) {
  return (
    <TradeSummaryColumn gap={SUMMARY_COLUMN_GAP_EM}>
      {rows.map((row, i) => (
        <SummaryRow key={i} {...row} />
      ))}
    </TradeSummaryColumn>
  )
}
