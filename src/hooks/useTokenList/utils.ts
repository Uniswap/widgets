import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { ZERO_ADDRESS } from 'wido'

type TokenMap = Readonly<{ [tokenAddress: string]: { token: WrappedTokenInfo; list?: TokenList } }>
export type ChainTokenMap = Readonly<{ [chainId: number]: TokenMap }>

type Mutable<T> = {
  -readonly [P in keyof T]: Mutable<T[P]>
}

const mapCache = typeof WeakMap !== 'undefined' ? new WeakMap<TokenList | TokenInfo[], ChainTokenMap>() : null

export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export function tokensToChainTokenMap(tokens: TokenList | TokenInfo[]): ChainTokenMap {
  const cached = mapCache?.get(tokens)
  if (cached) return cached

  const [list, infos] = Array.isArray(tokens) ? [undefined, tokens] : [tokens, tokens.tokens]
  const map = infos.reduce<Mutable<ChainTokenMap>>((map, info) => {
    if (info.address === ZERO_ADDRESS || info.address === NATIVE_ADDRESS) {
      console.warn(`Skipping native tokens`)
      return map
    }
    const token = new WrappedTokenInfo(info)
    if (map[token.chainId]?.[token.address] !== undefined) {
      console.warn(`Duplicate token skipped: ${token.address}`)
      return map
    }
    if (!map[token.chainId]) {
      map[token.chainId] = {}
    }
    map[token.chainId][token.address] = { token, list }
    return map
  }, {}) as ChainTokenMap
  mapCache?.set(tokens, map)
  return map
}
