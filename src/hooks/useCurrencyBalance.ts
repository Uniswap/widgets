import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useEffect, useMemo, useState } from 'react'
import { Balance, getBalances } from 'wido'

import { NATIVE_ADDRESS } from './useTokenList/utils'

export type BalanceMap = { [chainId: number]: { [tokenAddress: string]: CurrencyAmount<Token> | undefined } }

export function useTokenBalances(address?: string): BalanceMap {
  const [rawBalances, setRawBalances] = useState<Balance[]>([])

  useEffect(() => {
    if (!address) return
    getBalances(address)
      .then((x) => {
        x.push(
          {
            chainId: 5,
            address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            protocol: 'dex',
            usdPrice: '1648.62',
            symbol: 'ETH',
            name: 'ETH',
            decimals: 18,
            logoURI: 'https://etherscan.io/images/main/empty-token.png',
            balance: '42197516917118131',
            balanceUsdValue: '26.7',
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
            balance: '42197516917118131',
            balanceUsdValue: '26.7',
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
            balance: '42197516917118131',
            balanceUsdValue: '26.7',
          }
        )
        return x
      })
      .then(setRawBalances)
  }, [address])

  return useMemo(() => {
    return rawBalances.reduce((map: BalanceMap, item) => {
      if (!map[item.chainId]) {
        map[item.chainId] = {}
      }

      map[item.chainId][item.address] = CurrencyAmount.fromRawAmount(
        new Token(item.chainId, item.address, item.decimals, item.symbol, item.name),
        item.balance
      )
      //current.balance
      return map
    }, {} as BalanceMap)
  }, [rawBalances])
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): CurrencyAmount<Token> | undefined {
  const tokenBalances = useTokenBalances(account)
  if (!token) return undefined
  return tokenBalances[token.chainId][token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[]
): (CurrencyAmount<Currency> | undefined)[] {
  const tokenBalances = useTokenBalances(account)

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined
        if (currency.isToken) return tokenBalances[currency.chainId]?.[currency.address]
        if (currency.isNative) return tokenBalances[currency.chainId]?.[NATIVE_ADDRESS]
        return undefined
      }) ?? [],
    [account, currencies, tokenBalances]
  )
}

export default function useCurrencyBalance(
  account?: string,
  currency?: Currency
): CurrencyAmount<Currency> | undefined {
  return useCurrencyBalances(
    account,
    useMemo(() => [currency], [currency])
  )[0]
}
