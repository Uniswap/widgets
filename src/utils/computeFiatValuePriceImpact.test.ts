import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { DAI, USDC_MAINNET } from 'constants/tokens'

import { computeFiatValuePriceImpact } from './computeFiatValuePriceImpact'

describe('computeFiatValuePriceImpact', () => {
  it('should return undefined', () => {
    expect(computeFiatValuePriceImpact(null, null)).toBeUndefined()
  })

  it('should return 0: same currency, same value', () => {
    expect(
      computeFiatValuePriceImpact(
        CurrencyAmount.fromRawAmount(USDC_MAINNET, 100),
        CurrencyAmount.fromRawAmount(USDC_MAINNET, 100)
      )
    ).toEqual(new Percent(0, 100))
  })

  it('should return 0.5: same currency, different values', () => {
    expect(
      computeFiatValuePriceImpact(
        CurrencyAmount.fromRawAmount(USDC_MAINNET, 100),
        CurrencyAmount.fromRawAmount(USDC_MAINNET, 150)
      )?.toFixed(2)
    ).toEqual(new Percent(-50, 100).toFixed(2))
  })

  it('should return undefined: different currencies', () => {
    expect(
      computeFiatValuePriceImpact(
        CurrencyAmount.fromRawAmount(USDC_MAINNET, 100),
        CurrencyAmount.fromRawAmount(DAI, 150)
      )?.toFixed(2)
    ).toEqual(undefined)
  })
})
