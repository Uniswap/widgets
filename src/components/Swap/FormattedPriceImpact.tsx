import { Percent } from '@uniswap/sdk-core'
import { ErrorText } from 'components/Error/ErrorText'
import { warningSeverity } from 'utils/prices'

export const formatPriceImpact = (priceImpact: Percent) => `${priceImpact.multiply(-1).toFixed(2)}%`

/**
 * Formatted version of price impact text with warning colors
 */
export default function FormattedPriceImpact({ priceImpact }: { priceImpact?: Percent }) {
  return (
    <ErrorText fontWeight={500} fontSize={14} severity={warningSeverity(priceImpact)}>
      {priceImpact ? formatPriceImpact(priceImpact) : '-'}
    </ErrorText>
  )
}
