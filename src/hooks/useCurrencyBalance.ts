import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useMemo } from 'react'
import { Balance, getBalances, ZERO_ADDRESS } from 'wido'

import { useEvmAccountAddress, useSnAccountAddress } from './useSyncWidgetSettings'
import { NATIVE_ADDRESS } from './useTokenList/utils'

export type BalanceMap = { [chainId: number]: { [tokenAddress: string]: CurrencyAmount<Token> | undefined } }

export const evmBalancesAtom = atom<Balance[]>([])
export const evmFetchedBalancesAtom = atom<boolean>(false)

export const snBalancesAtom = atom<Balance[]>([])
export const snFetchedBalancesAtom = atom<boolean>(false)

export function useTokenBalances(): BalanceMap {
  const address = useEvmAccountAddress()
  const evmRawBalances = useAtomValue(evmBalancesAtom)
  const evmFetchedBalances = useAtomValue(evmFetchedBalancesAtom)
  const setEvmRawBalances = useUpdateAtom(evmBalancesAtom)
  const setEvmFetchedBalances = useUpdateAtom(evmFetchedBalancesAtom)

  if (!evmFetchedBalances && address) {
    setEvmFetchedBalances(true)
    getBalances(address).then(setEvmRawBalances)
  }

  const snAccount = useSnAccountAddress()
  const snRawBalances = useAtomValue(snBalancesAtom)
  const snFetchedBalances = useAtomValue(snFetchedBalancesAtom)
  const setSnRawBalances = useUpdateAtom(snBalancesAtom)
  const setSnFetchedBalances = useUpdateAtom(snFetchedBalancesAtom)

  if (!snFetchedBalances && snAccount) {
    setSnFetchedBalances(true)
    getBalances(snAccount).then(setSnRawBalances)
  }

  return useMemo(() => {
    return [...evmRawBalances, ...snRawBalances].reduce((map: BalanceMap, item) => {
      if (!map[item.chainId]) {
        map[item.chainId] = {}
      }

      map[item.chainId][item.address] = CurrencyAmount.fromRawAmount(
        new Token(item.chainId, ZERO_ADDRESS, item.decimals, item.symbol, item.name),
        item.balance
      )
      return map
    }, {} as BalanceMap)
  }, [evmRawBalances, snRawBalances])
}

export function useCurrencyBalances(currencies?: (Currency | undefined)[]): (CurrencyAmount<Currency> | undefined)[] {
  const tokenBalances = useTokenBalances()

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!currency) return undefined
        if (currency.isToken) return tokenBalances[currency.chainId]?.[currency.address]
        if (currency.isNative) return tokenBalances[currency.chainId]?.[NATIVE_ADDRESS]
        return undefined
      }) ?? [],
    [currencies, tokenBalances]
  )
}

export default function useCurrencyBalance(currency?: Currency): CurrencyAmount<Currency> | undefined {
  return useCurrencyBalances(useMemo(() => [currency], [currency]))[0]
}
