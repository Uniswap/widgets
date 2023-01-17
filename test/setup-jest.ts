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

beforeEach(() => {
  fetchMock.mockIf('https://gateway.ipfs.io/ipns/tokens.uniswap.org', JSON.stringify(tokenList))
})

beforeAll(async () => {
  await dynamicActivate('en-US')
})
