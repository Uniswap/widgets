import { Percent } from '@uniswap/sdk-core'

import { formatNumber, formatPriceImpact, formatSlippage, formatUSDPrice, NumberType } from './format'

it('formats token reference numbers correctly', () => {
  expect(formatNumber(1234567000000000, NumberType.TokenNonTx)).toBe('>999T')
  expect(formatNumber(1002345, NumberType.TokenNonTx)).toBe('1.00M')
  expect(formatNumber(1234, NumberType.TokenNonTx)).toBe('1,234.00')
  expect(formatNumber(0.00909, NumberType.TokenNonTx)).toBe('0.009')
  expect(formatNumber(0.09001, NumberType.TokenNonTx)).toBe('0.090')
  expect(formatNumber(0.00099, NumberType.TokenNonTx)).toBe('<0.001')
  expect(formatNumber(0, NumberType.TokenNonTx)).toBe('0')
})

it('formats token transaction numbers correctly', () => {
  expect(formatNumber(1234567.8901, NumberType.TokenTx)).toBe('1,234,567.89')
  expect(formatNumber(765432.1, NumberType.TokenTx)).toBe('765,432.10')

  expect(formatNumber(7654.321, NumberType.TokenTx)).toBe('7,654.32')
  expect(formatNumber(765.4321, NumberType.TokenTx)).toBe('765.432')
  expect(formatNumber(76.54321, NumberType.TokenTx)).toBe('76.5432')
  expect(formatNumber(7.654321, NumberType.TokenTx)).toBe('7.65432')
  expect(formatNumber(7.60000054321, NumberType.TokenTx)).toBe('7.60')
  expect(formatNumber(7.6, NumberType.TokenTx)).toBe('7.60')
  expect(formatNumber(7, NumberType.TokenTx)).toBe('7.00')

  expect(formatNumber(0.987654321, NumberType.TokenTx)).toBe('0.98765')
  expect(formatNumber(0.9, NumberType.TokenTx)).toBe('0.90')
  expect(formatNumber(0.901000123, NumberType.TokenTx)).toBe('0.901')
  expect(formatNumber(0.000000001, NumberType.TokenTx)).toBe('<0.00001')
  expect(formatNumber(0, NumberType.TokenTx)).toBe('0')
})

it('formats fiat estimates on token details pages correctly', () => {
  expect(formatNumber(1234567.891, NumberType.FiatTokenDetails)).toBe('$1.23M')
  expect(formatNumber(1234.5678, NumberType.FiatTokenDetails)).toBe('$1,234.57')
  expect(formatNumber(1.048942, NumberType.FiatTokenDetails)).toBe('$1.049')

  expect(formatNumber(0.001231, NumberType.FiatTokenDetails)).toBe('$0.00123')
  expect(formatNumber(0.00001231, NumberType.FiatTokenDetails)).toBe('$0.0000123')

  expect(formatNumber(0.0000001234, NumberType.FiatTokenDetails)).toBe('$0.000000123')
  expect(formatNumber(0.000000009876, NumberType.FiatTokenDetails)).toBe('<$0.00000001')
})

it('formats fiat estimates for tokens correctly', () => {
  expect(formatNumber(1234567.891, NumberType.FiatTokenPrice)).toBe('$1.23M')
  expect(formatNumber(1234.5678, NumberType.FiatTokenPrice)).toBe('$1,234.57')

  expect(formatNumber(0.010235, NumberType.FiatTokenPrice)).toBe('$0.0102')
  expect(formatNumber(0.001231, NumberType.FiatTokenPrice)).toBe('$0.00123')
  expect(formatNumber(0.00001231, NumberType.FiatTokenPrice)).toBe('$0.0000123')

  expect(formatNumber(0.0000001234, NumberType.FiatTokenPrice)).toBe('$0.000000123')
  expect(formatNumber(0.000000009876, NumberType.FiatTokenPrice)).toBe('<$0.00000001')
})

it('formats fiat estimates for token stats correctly', () => {
  expect(formatNumber(1234576, NumberType.FiatTokenStats)).toBe('$1.2M')
  expect(formatNumber(234567, NumberType.FiatTokenStats)).toBe('$234.6K')
  expect(formatNumber(123.456, NumberType.FiatTokenStats)).toBe('$123.46')
  expect(formatNumber(1.23, NumberType.FiatTokenStats)).toBe('$1.23')
  expect(formatNumber(0.123, NumberType.FiatTokenStats)).toBe('$0.12')
  expect(formatNumber(0.00123, NumberType.FiatTokenStats)).toBe('<$0.01')
  expect(formatNumber(0, NumberType.FiatTokenStats)).toBe('-')
})

it('formats gas USD prices correctly', () => {
  expect(formatNumber(1234567.891, NumberType.FiatGasPrice)).toBe('$1.23M')
  expect(formatNumber(18.448, NumberType.FiatGasPrice)).toBe('$18.45')
  expect(formatNumber(0.0099, NumberType.FiatGasPrice)).toBe('<$0.01')
})

it('formats USD token quantities prices correctly', () => {
  expect(formatNumber(1234567.891, NumberType.FiatTokenQuantity)).toBe('$1.23M')
  expect(formatNumber(18.448, NumberType.FiatTokenQuantity)).toBe('$18.45')
  expect(formatNumber(0.0099, NumberType.FiatTokenQuantity)).toBe('<$0.01')
  expect(formatNumber(0, NumberType.FiatTokenQuantity)).toBe('$0.00')
})

it('formats Swap text input/output numbers correctly', () => {
  expect(formatNumber(1234567.8901, NumberType.SwapTradeAmount)).toBe('1234570')
  expect(formatNumber(765432.1, NumberType.SwapTradeAmount)).toBe('765432')

  expect(formatNumber(7654.321, NumberType.SwapTradeAmount)).toBe('7654.32')
  expect(formatNumber(765.4321, NumberType.SwapTradeAmount)).toBe('765.432')
  expect(formatNumber(76.54321, NumberType.SwapTradeAmount)).toBe('76.5432')
  expect(formatNumber(7.654321, NumberType.SwapTradeAmount)).toBe('7.65432')
  expect(formatNumber(7.60000054321, NumberType.SwapTradeAmount)).toBe('7.60')
  expect(formatNumber(7.6, NumberType.SwapTradeAmount)).toBe('7.60')
  expect(formatNumber(7, NumberType.SwapTradeAmount)).toBe('7.00')

  expect(formatNumber(0.987654321, NumberType.SwapTradeAmount)).toBe('0.98765')
  expect(formatNumber(0.9, NumberType.SwapTradeAmount)).toBe('0.90')
  expect(formatNumber(0.901000123, NumberType.SwapTradeAmount)).toBe('0.901')
  expect(formatNumber(0.000000001, NumberType.SwapTradeAmount)).toBe('0.000000001')
  expect(formatNumber(0, NumberType.SwapTradeAmount)).toBe('0')
})

it('formats NFT numbers correctly', () => {
  expect(formatNumber(1234567000000000, NumberType.NFTTokenFloorPrice)).toBe('>999T')
  expect(formatNumber(1002345, NumberType.NFTTokenFloorPrice)).toBe('1M')
  expect(formatNumber(1234, NumberType.NFTTokenFloorPrice)).toBe('1.23K')
  expect(formatNumber(12.34467, NumberType.NFTTokenFloorPrice)).toBe('12.34')
  expect(formatNumber(12.1, NumberType.NFTTokenFloorPrice)).toBe('12.1')
  expect(formatNumber(0.00909, NumberType.NFTTokenFloorPrice)).toBe('0.009')
  expect(formatNumber(0.09001, NumberType.NFTTokenFloorPrice)).toBe('0.09')
  expect(formatNumber(0.00099, NumberType.NFTTokenFloorPrice)).toBe('<0.001')
  expect(formatNumber(0, NumberType.NFTTokenFloorPrice)).toBe('0')

  expect(formatNumber(12.1, NumberType.NFTTokenFloorPriceTrailingZeros)).toBe('12.10')
  expect(formatNumber(0.09001, NumberType.NFTTokenFloorPriceTrailingZeros)).toBe('0.090')

  expect(formatNumber(0.987654321, NumberType.NFTCollectionStats)).toBe('0.98765')
  expect(formatNumber(0.9, NumberType.NFTCollectionStats)).toBe('0.9')
  expect(formatNumber(76543.21, NumberType.NFTCollectionStats)).toBe('76543.2')
  expect(formatNumber(7.60000054321, NumberType.NFTCollectionStats)).toBe('7.6')
  expect(formatNumber(1234567890, NumberType.NFTCollectionStats)).toBe('1.23457B')
  expect(formatNumber(1234567000000000, NumberType.NFTCollectionStats)).toBe('>999T')
})

describe('formatUSDPrice', () => {
  it('should correctly format 0.000000009876', () => {
    expect(formatUSDPrice(0.000000009876)).toBe('<$0.00000001')
  })
  it('should correctly format 0.00001231', () => {
    expect(formatUSDPrice(0.00001231)).toBe('$0.0000123')
  })
  it('should correctly format 0.001231', () => {
    expect(formatUSDPrice(0.001231)).toBe('$0.00123')
  })
  it('should correctly format 0.0', () => {
    expect(formatUSDPrice(0.0)).toBe('$0.00')
  })
  it('should correctly format 0', () => {
    expect(formatUSDPrice(0)).toBe('$0.00')
  })
  it('should correctly format 1.048942', () => {
    expect(formatUSDPrice(1.048942)).toBe('$1.049')
  })
  it('should correctly format 0.10235', () => {
    expect(formatUSDPrice(0.10235)).toBe('$0.102')
  })
  it('should correctly format 1234.5678', () => {
    expect(formatUSDPrice(1_234.5678)).toBe('$1,234.57')
  })
  it('should correctly format 1234567.8910', () => {
    expect(formatUSDPrice(1_234_567.891)).toBe('$1.23M')
  })
  it('should correctly format 1000000000000', () => {
    expect(formatUSDPrice(1_000_000_000_000)).toBe('$1.00T')
  })
  it('should correctly format 1000000000000000', () => {
    expect(formatUSDPrice(1_000_000_000_000_000)).toBe('>$999T')
  })
})

describe('formatPriceImpact', () => {
  it('should correctly format undefined', () => {
    expect(formatPriceImpact(undefined)).toBe('-')
  })

  it('correctly formats a percent with 3 significant digits', () => {
    expect(formatPriceImpact(new Percent(-1, 100000))).toBe('0.001%')
    expect(formatPriceImpact(new Percent(-1, 1000))).toBe('0.100%')
    expect(formatPriceImpact(new Percent(-1, 100))).toBe('1.000%')
    expect(formatPriceImpact(new Percent(-1, 10))).toBe('10.000%')
    expect(formatPriceImpact(new Percent(-1, 1))).toBe('100.000%')
  })
})

describe('formatSlippage', () => {
  it('should correctly format undefined', () => {
    expect(formatSlippage(undefined)).toBe('-')
  })

  it('correctly formats a percent with 3 significant digits', () => {
    expect(formatSlippage(new Percent(1, 100000))).toBe('0.001%')
    expect(formatSlippage(new Percent(1, 1000))).toBe('0.100%')
    expect(formatSlippage(new Percent(1, 100))).toBe('1.000%')
    expect(formatSlippage(new Percent(1, 10))).toBe('10.000%')
    expect(formatSlippage(new Percent(1, 1))).toBe('100.000%')
  })
})
