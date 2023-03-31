import { Trans } from '@lingui/macro'
import { formatPriceImpact } from '@uniswap/conedison/format'
import Row from 'components/Row'
import Tooltip, { SmallToolTipBody, TooltipText } from 'components/Tooltip'
import { PriceImpact } from 'hooks/usePriceImpact'
import { AlertTriangle } from 'icons'
import { ThemedText } from 'theme'

interface PriceImpactProps {
  impact: PriceImpact | undefined | null
  tooltipText?: string
  reverse?: boolean
}

export function PriceImpactRow({ impact, reverse, tooltipText }: PriceImpactProps) {
  if (!impact) {
    return null
  }
  return (
    <Row gap={0.25} flex align="center" flow={reverse ? 'row-reverse' : 'row wrap'}>
      <ThemedText.Body2 userSelect={false} color={impact.warning ?? 'hint'}>
        <TooltipText text={`(${formatPriceImpact(impact?.percent)})`}>
          <ThemedText.Caption>{tooltipText}</ThemedText.Caption>
        </TooltipText>
      </ThemedText.Body2>
      {impact?.warning && (
        <Tooltip icon={AlertTriangle} iconProps={{ color: impact.warning }} data-testid="alert-tooltip">
          <SmallToolTipBody>
            <Trans>
              There will be a large difference between your input and output values due to current liquidity.
            </Trans>
          </SmallToolTipBody>
        </Tooltip>
      )}
    </Row>
  )
}
