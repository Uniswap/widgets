import tokenList from '@uniswap/default-token-list'
import { dynamicActivate } from 'i18n'
import fetch from 'jest-fetch-mock'

fetch.enableMocks()

beforeEach(() => {
  fetchMock.mockIf('https://gateway.ipfs.io/ipns/tokens.uniswap.org', JSON.stringify(tokenList))
})

beforeAll(async () => {
  await dynamicActivate('en-US')
})
