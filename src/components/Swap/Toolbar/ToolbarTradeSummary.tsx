import Column from 'components/Column'
import Row from 'components/Row'
import Tooltip, { TooltipText } from 'components/Tooltip'
import { Icon } from 'icons'
import { ReactNode } from 'react'
import styled from 'styled-components/macro'
import { Color, ThemedText } from 'theme'
import { Body2LineHeightRem } from 'theme/type'

export const SUMMARY_COLUMN_GAP_REM = 0.75
export const SUMMARY_ROW_HEIGHT_REM = Body2LineHeightRem + SUMMARY_COLUMN_GAP_REM

const TradeSummaryColumn = styled(Column)`
  border-bottom: 1px solid ${({ theme }) => theme.outline};
  border-top: 1px solid ${({ theme }) => theme.outline};
  margin: 0 1rem;
  padding: ${SUMMARY_COLUMN_GAP_REM}rem 0;
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
          <TradeAttributeName color={color}>
            <TooltipText text={name} placement="top">
              <ThemedText.Caption>{nameTooltip.content}</ThemedText.Caption>
            </TooltipText>
          </TradeAttributeName>
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
    <TradeSummaryColumn gap={SUMMARY_COLUMN_GAP_REM}>
      {rows.map((row, i) => (
        <SummaryRow key={i} {...row} />
      ))}
    </TradeSummaryColumn>
  )
}
