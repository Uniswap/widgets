import { useWeb3React } from '@web3-react/core'
import { useTokenBalances } from 'hooks/useCurrencyBalance'
import useDebounce from 'hooks/useDebounce'
import { useMemo } from 'react'

import { getTokenFilter } from './filtering'
import { tokenComparator, useSortTokensByQuery } from './sorting'
import { TokenListItem } from './utils'

export function useQueryTokens(query: string, tokens: TokenListItem[]) {
  const { account } = useWeb3React()
  const balances = useTokenBalances(account)
  const sortedTokens = useMemo(
    // Create a new array because sort is in-place and returns a referentially equivalent array.
    () => Array.from(tokens).sort(tokenComparator.bind(null, balances)),
    [balances, tokens]
  )

  const debouncedQuery = useDebounce(query, 200)
  const filter = useMemo(() => getTokenFilter(debouncedQuery), [debouncedQuery])
  const filteredTokens = useMemo(() => sortedTokens.filter(filter), [filter, sortedTokens])

  const queriedTokens = useSortTokensByQuery(debouncedQuery, filteredTokens)
  return queriedTokens
}
