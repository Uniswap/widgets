import { Percent } from '@uniswap/sdk-core'

import { formatPercentage } from './formatPercentage'

describe('formatPercentage', () => {
  it('round to zero when tiny percentage', () => {
    expect(formatPercentage(new Percent(1, 1000))).toEqual('0.00%')
  })
  it('two decimals when larger percentage', () => {
    expect(formatPercentage(new Percent(100, 3))).toEqual('33.33%')
  })
})
