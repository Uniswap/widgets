import { Trans } from '@lingui/macro'
import { formatSlippage } from '@uniswap/conedison/format'
import Row from 'components/Row'
import Tooltip, { SmallToolTipBody, TooltipText } from 'components/Tooltip'
import { PriceImpact } from 'hooks/usePriceImpact'
import { AlertTriangle } from 'icons'
import { ThemedText } from 'theme'

interface FiatValueChangeRowProps {
  impact: PriceImpact | undefined | null
  tooltipText?: string
  reverse?: boolean
}

export function FiatValueChangeRow({ impact, reverse, tooltipText }: FiatValueChangeRowProps) {
  if (!impact) {
    return null
  }
  return (
    <Row gap={0.25} flex align="center" flow={reverse ? 'row-reverse' : 'row wrap'}>
      <ThemedText.Body2 userSelect={false} color={impact.warning ?? 'hint'}>
        <TooltipText text={`(${formatSlippage(impact?.percent)})`}>{tooltipText}</TooltipText>
      </ThemedText.Body2>
      {impact?.warning && impact?.warning !== 'success' && (
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
