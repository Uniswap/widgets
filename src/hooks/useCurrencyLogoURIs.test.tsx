import { Currency } from '@uniswap/sdk-core'
import { renderHook } from 'test'
import { USDC } from 'test/utils'

import useCurrencyLogoURIs from './useCurrencyLogoURIs'

describe('useCurrencyLogoURIs', () => {
  it('returns the uniswap-managed GH hosted URL first', () => {
    const currency: Currency & { logoURI?: string } = {
      isNative: false,
      isToken: true,
      chainId: 1,
      address: '0x111111111117dC0aa78b770fA6A738034120C302',
      name: '1inch',
      symbol: '1INCH',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png?1608803028',
      equals: jest.fn(),
      sortsBefore: jest.fn(),
      wrapped: USDC,
    }
    const { result } = renderHook(() => useCurrencyLogoURIs(currency))
    expect(result.current).toEqual([
      'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x111111111117dC0aa78b770fA6A738034120C302/logo.png',
      'https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png?1608803028',
    ])
  })
})
