import { Percent } from '@uniswap/sdk-core'

export function formatPercentage(percentage: Percent): string {
  const exactFloat = Number(percentage.numerator) / Number(percentage.denominator)
  if (exactFloat < 0.005) {
    return '0.00%'
  }
  return `${exactFloat.toFixed(2)}%`
}
