import 'jest-environment-hardhat'

import tokenList from '@uniswap/default-token-list'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { dynamicActivate } from 'i18n'
import fetch from 'jest-fetch-mock'

fetch.enableMocks()

jest.mock('@uniswap/conedison/format', () => ({
  formatCurrencyAmount: jest.fn((amount: CurrencyAmount<Currency>) => amount.toFixed(2)),
  formatPriceImpact: jest.fn((percent: Percent) => percent.toFixed(2) + '%'),
  NumberType: {
    FiatGasPrice: 'fiat-gas-price',
  },
}))

const MOCK_TYPED_DATA_SIG =
  '0x1befd08fcc4085dc484346d69fd15659616522454a33e66e7b0f6917379ab888236304ebed307813208bf004da04d998dcd15a8f83241d033e4040adc4b0b5311b'

jest.mock('@uniswap/conedison/provider/signing', () => ({
  signTypedData: () => Promise.resolve(MOCK_TYPED_DATA_SIG),
}))

beforeEach(() => {
  fetchMock.mockIf('https://gateway.ipfs.io/ipns/tokens.uniswap.org', JSON.stringify(tokenList))
})

beforeAll(async () => {
  await dynamicActivate('en-US')
})
