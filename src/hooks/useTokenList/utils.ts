import { NativeCurrency, Token } from '@uniswap/sdk-core'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { nativeOnChain } from 'constants/tokens'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { Token as WidoToken, ZERO_ADDRESS } from 'wido'

export type TokenListItem = Token | NativeCurrency
type TokenMap = Readonly<{ [tokenAddress: string]: { token: TokenListItem; list?: TokenList } }>
export type ChainTokenMap = Readonly<{ [chainId: number]: TokenMap }>

type Mutable<T> = {
  -readonly [P in keyof T]: Mutable<T[P]>
}

const mapCache = typeof WeakMap !== 'undefined' ? new WeakMap<TokenList | TokenInfo[], ChainTokenMap>() : null

export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export function tokensToChainTokenMap(tokens: WidoToken[]): ChainTokenMap {
  tokens.push(
    {
      chainId: 5,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      protocol: 'dex',
      usdPrice: '0.0',
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      logoURI: 'https://etherscan.io/images/main/empty-token.png',
    },

    {
      chainId: 51400,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      protocol: 'dex',
      usdPrice: '1648.62',
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      logoURI: 'https://etherscan.io/images/main/empty-token.png',
    },
    {
      chainId: 51401,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      protocol: 'dex',
      usdPrice: '1648.62',
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      logoURI: 'https://etherscan.io/images/main/empty-token.png',
    },
    {
      chainId: 51400,
      address: '0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9',
      protocol: 'dex',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI: 'https://etherscan.io/images/main/empty-token.png',
    },
    {
      chainId: 51400,
      address: '0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9',
      protocol: 'dex',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI: 'https://etherscan.io/images/main/empty-token.png',
    }
  )

  const cached = mapCache?.get(tokens)
  if (cached) return cached

  const map = tokens.reduce<Mutable<ChainTokenMap>>((map, info) => {
    if (info.address === ZERO_ADDRESS) {
      console.warn(`Skipping zero address tokens`)
      return map
    }
    if (!map[info.chainId]) {
      map[info.chainId] = {}
    }

    if (info.address === NATIVE_ADDRESS) {
      map[info.chainId][NATIVE_ADDRESS] = { token: nativeOnChain(info.chainId) }
    }

    const token = new WrappedTokenInfo(info)
    if (map[token.chainId]?.[token.address] !== undefined) {
      console.warn(`Duplicate token skipped: ${token.address}`)
      return map
    }
    map[token.chainId][token.address] = { token }
    return map
  }, {}) as ChainTokenMap
  mapCache?.set(tokens, map)
  return map
}
