import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { BalanceMap } from 'hooks/useCurrencyBalance'
import { useMemo } from 'react'

import { NATIVE_ADDRESS, TokenListItem } from './utils'
const IMPORTANT_TOKENS = ['ETH', 'WETH', 'DAI', 'USDC', 'USDT', 'WBTC']

/** Sorts currency amounts (descending). */
function balanceComparator(a?: CurrencyAmount<Currency>, b?: CurrencyAmount<Currency>) {
  if (a && b) {
    return a.greaterThan(b) ? -1 : a.equalTo(b) ? 0 : 1
  } else if (a?.greaterThan('0')) {
    return -1
  } else if (b?.greaterThan('0')) {
    return 1
  }
  return 0
}

/** Sorts tokens by currency amount (descending), then symbol (ascending). */
export function tokenComparator(balances: BalanceMap, a: TokenListItem, b: TokenListItem) {
  // Sorts by balances
  const balanceComparison = balanceComparator(
    balances[a.chainId]?.[a.isNative ? NATIVE_ADDRESS : a.address],
    balances[b.chainId]?.[b.isNative ? NATIVE_ADDRESS : b.address]
  )
  if (balanceComparison !== 0) return balanceComparison

  // Sorts by symbol
  if (a.symbol && b.symbol) {
    if (a.symbol === b.symbol) return 0

    if (IMPORTANT_TOKENS.includes(a.symbol) && !IMPORTANT_TOKENS.includes(b.symbol)) {
      return -1
    }

    if (IMPORTANT_TOKENS.includes(b.symbol) && !IMPORTANT_TOKENS.includes(a.symbol)) {
      return 1
    }

    return a.symbol.toLowerCase() < b.symbol.toLowerCase() ? -1 : 1
  }

  return -1
}

/** Sorts tokens by query, giving precedence to exact matches and partial matches. */
export function useSortTokensByQuery<T extends TokenListItem>(query: string, tokens?: T[]): T[] {
  return useMemo(() => {
    if (!tokens) {
      return []
    }

    const matches = query
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0)

    if (matches.length > 1) {
      return tokens
    }

    const exactMatches: T[] = []
    const symbolSubtrings: T[] = []
    const rest: T[] = []

    // sort tokens by exact match -> subtring on symbol match -> rest
    tokens.map((token) => {
      if (token.symbol?.toLowerCase() === matches[0]) {
        return exactMatches.push(token)
      } else if (token.symbol?.toLowerCase().startsWith(query.toLowerCase().trim())) {
        return symbolSubtrings.push(token)
      } else {
        return rest.push(token)
      }
    })

    return [...exactMatches, ...symbolSubtrings, ...rest]
  }, [tokens, query])
}
