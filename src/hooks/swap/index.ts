import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { useAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { pickAtom } from 'state/atoms'
import { controlledAtom, Field, swapAtom } from 'state/swap'
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
  const onSwitchTokens = useAtomValue(controlledAtom)?.onSwitchTokens
  const setSwap = useUpdateAtom(swapAtom)
  return useCallback(() => {
    setSwap((swap) => {
      if (onSwitchTokens) {
        onSwitchTokens({
          type: swap.independentField === Field.INPUT ? TradeType.EXACT_OUTPUT : TradeType.EXACT_INPUT,
          amount: swap.amount,
          inputToken: swap[Field.OUTPUT],
          outputToken: swap[Field.INPUT],
        })
      } else {
        const oldOutput = swap[Field.OUTPUT]
        swap[Field.OUTPUT] = swap[Field.INPUT]
        swap[Field.INPUT] = oldOutput
        switch (swap.independentField) {
          case Field.INPUT:
            swap.independentField = Field.OUTPUT
            break
          case Field.OUTPUT:
            swap.independentField = Field.INPUT
            break
        }
      }
    })
  }, [onSwitchTokens, setSwap])
}

export function useSwapCurrency(field: Field): [Currency | undefined, (currency: Currency) => void] {
  const currencyAtom = useMemo(() => pickAtom(swapAtom, field), [field])
  const [currency, setCurrency] = useAtom(currencyAtom)
  const otherCurrencyAtom = useMemo(() => pickAtom(swapAtom, otherField(field)), [field])
  const otherCurrency = useAtomValue(otherCurrencyAtom)
  const onTokenChange = useAtomValue(controlledAtom)?.onTokenChange
  const switchSwapCurrencies = useSwitchSwapCurrencies()
  const setOrSwitchCurrency = useCallback(
    (update: Currency) => {
      if (update === currency) return
      if (update === otherCurrency) {
        switchSwapCurrencies()
      } else {
        if (onTokenChange) {
          onTokenChange(field, update)
        } else {
          setCurrency(update)
        }
      }
    },
    [currency, field, onTokenChange, otherCurrency, setCurrency, switchSwapCurrencies]
  )
  return [currency, setOrSwitchCurrency]
}

const independentFieldAtom = pickAtom(swapAtom, 'independentField')

export function useIsSwapFieldIndependent(field: Field): boolean {
  const independentField = useAtomValue(independentFieldAtom)
  return independentField === field
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

  const onAmountChange = useAtomValue(controlledAtom)?.onAmountChange
  const setSwap = useUpdateAtom(swapAtom)
  const updateAmount = useCallback(
    (update: string) => {
      if (update === amount) return
      if (onAmountChange) {
        onAmountChange(field, update)
      } else {
        setSwap((swap) => {
          swap.independentField = field
          swap.amount = update
        })
      }
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
