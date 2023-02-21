import { SupportedChainId } from '@uniswap/sdk-core'
import { nativeOnChain } from 'constants/tokens'
import { renderHook } from 'test'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import { useLogos } from './hooks'

describe('useLogos', () => {
  const testCurrencyAssetsRepoUri =
    'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x111111111117dC0aa78b770fA6A738034120C302/logo.png'

  it('returns the uniswap-managed GH hosted URL first', () => {
    const logoURI = 'https://1inch.io/img/logo.png'
    const { result } = renderHook(() =>
      useLogos({
        isNative: false,
        chainId: 1,
        address: '0x111111111117dC0aa78b770fA6A738034120C302',
        logoURI,
      })
    )

    expect(result.current).toEqual([testCurrencyAssetsRepoUri, logoURI])
  })

  it('replaces lo-res coingecko logos with large images', () => {
    const coingeckoThumb = 'https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png?1608803028'
    const coingeckoSmall = 'https://assets.coingecko.com/coins/images/13469/small/1inch-token.png?1608803028'

    const { result: resultThumb } = renderHook(() =>
      useLogos({
        isNative: false,
        chainId: 1,
        address: '0xB98d4C97425d9908E66E53A6fDf673ACcA0BE986',
        logoURI: coingeckoThumb,
      })
    )

    const coingeckoLarge = 'https://assets.coingecko.com/coins/images/13469/large/1inch-token.png?1608803028'

    expect(resultThumb.current?.[1]).toEqual(coingeckoLarge)

    const { result: resultSmall } = renderHook(() =>
      useLogos({
        isNative: false,
        chainId: 1,
        address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        logoURI: coingeckoSmall,
      })
    )
    expect(resultSmall.current?.[1]).toEqual(coingeckoLarge)
  })

  it("doesn't provide an assets repo uri when presented with non-checksummable address", () => {
    const logoURI = 'https://test/test.png'
    const { result: resultThumb } = renderHook(() =>
      useLogos({
        isNative: false,
        chainId: 1,
        address: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        logoURI,
      })
    )

    expect(resultThumb.current).toEqual([logoURI])
  })

  const nativeAssetsRepoUri =
    'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/info/logo.png'

  it('returns local native uri first followed by assets repo native', () => {
    const native = nativeOnChain(SupportedChainId.MAINNET)
    const { result } = renderHook(() => useLogos(native))
    expect(result.current).toEqual([EthereumLogo, nativeAssetsRepoUri])
  })
})
