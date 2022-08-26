import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { pickAtom } from 'state/atoms'
import { Field, swapAtom, swapEventHandlersAtom } from 'state/swap'
import { invertTradeType, toTradeType } from 'utils/tradeType'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'
export { default as useSwapInfo } from './useSwapInfo'

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

// check if any amount has been entered by user
export function useIsAmountPopulated() {
  return Boolean(useAtomValue(amountAtom))
}

export function useSwapAmount(field: Field): [string | undefined, (amount: string) => void] {
  const value = useAtomValue(amountAtom)
  const isFieldIndependent = useIsSwapFieldIndependent(field)
  const amount = isFieldIndependent ? value : undefined

  const { onAmountChange } = useAtomValue(swapEventHandlersAtom)
  const setSwap = useUpdateAtom(swapAtom)
  const updateAmount = useCallback(
    (update: string) => {
      if (update === amount) return
      onAmountChange?.(field, update)
      setSwap((swap) => {
        swap.type = toTradeType(field)
        swap.amount = update
      })
    },
    [amount, field, onAmountChange, setSwap]
  )
  return [amount, updateAmount]
}

export function useSwapCurrencyAmount(field: Field): CurrencyAmount<Currency> | undefined {
  const isFieldIndependent = useIsSwapFieldIndependent(field)
  const isAmountPopulated = useIsAmountPopulated()
  const [swapAmount] = useSwapAmount(field)
  const [swapCurrency] = useSwapCurrency(field)
  const currencyAmount = useMemo(() => tryParseCurrencyAmount(swapAmount, swapCurrency), [swapAmount, swapCurrency])
  if (isFieldIndependent && isAmountPopulated) {
    return currencyAmount
  }
  return
}
