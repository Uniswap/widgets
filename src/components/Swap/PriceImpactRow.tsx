import { Trans } from '@lingui/macro'
import Row from 'components/Row'
import Tooltip, { SmallToolTipBody } from 'components/Tooltip'
import { PriceImpact } from 'hooks/usePriceImpact'
import { AlertTriangle } from 'icons'
import { ThemedText } from 'theme'

interface PriceImpactProps {
  impact: PriceImpact | undefined | null
  reverse?: boolean
}

export function PriceImpactRow({ impact, reverse }: PriceImpactProps) {
  if (!impact) {
    return null
  }
  return (
    <Row gap={0.25} flex align="center" flow={reverse ? 'row-reverse' : 'row wrap'}>
      <ThemedText.Body2 userSelect={false} color={impact.warning ?? 'hint'}>
        ({impact.toString()})
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
