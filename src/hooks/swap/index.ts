import { Currency } from '@uniswap/sdk-core'
import { useAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { pickAtom } from 'state/atoms'
import { Field, swapAtom, swapEventHandlersAtom } from 'state/swap'
import { invertTradeType, toTradeType } from 'utils/tradeType'
export { ChainError, default as useSwapInfo } from './useSwapInfo'

function otherField(field: Field) {
  switch (field) {
    case Field.INPUT:
      return Field.OUTPUT
      break
    case Field.OUTPUT:
      return Field.INPUT
      break
  }
}

export function useSwitchSwapCurrencies() {
  const { onSwitchTokens } = useAtomValue(swapEventHandlersAtom)
  const setSwap = useUpdateAtom(swapAtom)
  return useCallback(() => {
    setSwap((swap) => {
      onSwitchTokens?.()
      swap.type = invertTradeType(swap.type)
      const oldOutput = swap[Field.OUTPUT]
      swap[Field.OUTPUT] = swap[Field.INPUT]
      swap[Field.INPUT] = oldOutput
    })
  }, [onSwitchTokens, setSwap])
}

export function useSwapCurrency(field: Field): [Currency | undefined, (currency: Currency) => void] {
  const currencyAtom = useMemo(() => pickAtom(swapAtom, field), [field])
  const [currency, setCurrency] = useAtom(currencyAtom)
  const otherCurrencyAtom = useMemo(() => pickAtom(swapAtom, otherField(field)), [field])
  const otherCurrency = useAtomValue(otherCurrencyAtom)
  const { onTokenChange } = useAtomValue(swapEventHandlersAtom)
  const switchSwapCurrencies = useSwitchSwapCurrencies()
  const setOrSwitchCurrency = useCallback(
    (update: Currency) => {
      if (update === currency) return
      if (update === otherCurrency) {
        switchSwapCurrencies()
      } else {
        onTokenChange?.(field, update)
        setCurrency(update)
      }
    },
    [currency, field, onTokenChange, otherCurrency, setCurrency, switchSwapCurrencies]
  )
  return [currency, setOrSwitchCurrency]
}

const tradeTypeAtom = pickAtom(swapAtom, 'type')

export function useIsSwapFieldIndependent(field: Field): boolean {
  const type = useAtomValue(tradeTypeAtom)
  return type === toTradeType(field)
}

const amountAtom = pickAtom(swapAtom, 'amount')

/** Returns true if the user has entered a non-zero amount. */
export function useIsAmountPopulated() {
  return Boolean(Number(useAtomValue(amountAtom)))
}

export function useSwapAmount(field: Field): [string | undefined, (amount: string, origin?: 'max') => void] {
  const value = useAtomValue(amountAtom)
  const isFieldIndependent = useIsSwapFieldIndependent(field)
  const amount = isFieldIndependent ? value : undefined

  const { onAmountChange } = useAtomValue(swapEventHandlersAtom)
  const setSwap = useUpdateAtom(swapAtom)
  const updateAmount = useCallback(
    (update: string, origin?: 'max') => {
      if (update === amount) return
      onAmountChange?.(field, update, origin)
      setSwap((swap) => {
        swap.type = toTradeType(field)
        swap.amount = update
      })
    },
    [amount, field, onAmountChange, setSwap]
  )
  return [amount, updateAmount]
}
