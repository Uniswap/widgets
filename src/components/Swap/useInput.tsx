import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import {
  useIsSwapFieldIndependent,
  useSwapAmount,
  useSwapCurrency,
  useSwapCurrencyAmount,
  useSwapInfo,
} from 'hooks/swap'

import { useEffect, useMemo } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import { maxAmountSpend } from 'utils/maxAmountSpend'

export interface InputProps {
  disabled: boolean
  amount?: string
  currency?: Currency
}


export interface Props {
  input: InputProps,
  output: InputProps
}


interface UseFormattedFieldAmountArguments {
  disabled: boolean
  currencyAmount?: CurrencyAmount<Currency>
  fieldAmount?: string
}

export function useFormattedFieldAmount({ disabled, currencyAmount, fieldAmount }: UseFormattedFieldAmountArguments) {
  return useMemo(() => {
    if (disabled) {
      return ''
    }
    if (fieldAmount !== undefined) {
      return fieldAmount
    }
    if (currencyAmount) {
      return currencyAmount.toSignificant(6)
    }
    return ''
  }, [disabled, currencyAmount, fieldAmount])
}

export default function useInput({ input, output }: Props) {
  const swapInfo = useSwapInfo()
  const {
    [Field.INPUT]: { balance, amount: tradeCurrencyAmount },
    trade: { state: tradeState },
  } = swapInfo


  const [inputAmount, updateInputAmount] = useSwapAmount(Field.INPUT)
  const [inputCurrency, updateInputCurrency] = useSwapCurrency(Field.INPUT)

  const [outputAmount, updateSwapOutputAmount] = useSwapAmount(Field.OUTPUT)
  const [outputCurrency, updateSwapOutputCurrency] = useSwapCurrency(Field.OUTPUT)

  const inputCurrencyAmount = useSwapCurrencyAmount(Field.INPUT)

  useEffect(() => {
    if(!input.amount) return
    if(!input.currency) return
    
    updateInputAmount(input.amount)
    updateInputCurrency(input.currency)
  }, [input.amount, input.currency])

  useEffect(() => {
    if(!output.amount) return
    if(!output.currency) return

    updateSwapOutputAmount(output.amount)
    updateSwapOutputCurrency(output.currency)
  }, [output.amount, output.currency])

  const isRouteLoading = input.disabled || tradeState === TradeState.SYNCING || tradeState === TradeState.LOADING
  const isDependentField = !useIsSwapFieldIndependent(Field.INPUT)
  const isLoading = isRouteLoading && isDependentField

  const max = useMemo(() => {
    const maxAmount = maxAmountSpend(balance)
    return maxAmount?.greaterThan(0) ? maxAmount.toExact() : undefined
  }, [balance])

  const formattedInputAmount = useFormattedFieldAmount({
    disabled: input.disabled,
    currencyAmount: tradeCurrencyAmount,
    fieldAmount: inputAmount,
  })

  return { swapInfo, inputAmount: formattedInputAmount, output, max, isLoading, inputCurrencyAmount, outputAmount }
}
