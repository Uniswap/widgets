import { Currency } from '@uniswap/sdk-core'
import { useSwapAmount, useSwapCurrency } from 'hooks/swap'
import { useAtomValue } from 'jotai/utils'
import { useEffect } from 'react'
import { Field, IsControlledSwapState, isControlledSwapStateAtom, OnSwapChangeCallbacks } from 'state/swap'

export interface ControlledStateProps extends OnSwapChangeCallbacks {
  inputToken?: Currency
  outputToken?: Currency
  amount?: string | number // BigIntIsh? which = JSBI | string | number
  independentField?: Field
  defaultTokenSelectorDisabled?: boolean
}

export function getIsControlledSwapState({
  inputToken,
  onInputTokenChange,
  outputToken,
  onOutputTokenChange,
  amount,
  onAmountChange,
  independentField,
  onIndependentFieldChange,
  defaultTokenSelectorDisabled,
}: ControlledStateProps): IsControlledSwapState {
  return {
    isControlledAmount:
      amount !== undefined || Boolean(onAmountChange) || Boolean(independentField) || Boolean(onIndependentFieldChange),
    isControlledToken:
      Boolean(inputToken) || Boolean(onInputTokenChange) || Boolean(outputToken) || Boolean(onOutputTokenChange),
  }
}

export default function useSyncControlledStateProps(controlledStateProps: ControlledStateProps) {
  const {
    inputToken,
    onInputTokenChange,
    outputToken,
    onOutputTokenChange,
    amount,
    onAmountChange,
    independentField,
    onIndependentFieldChange,
    defaultTokenSelectorDisabled,
  } = controlledStateProps

  const { isControlledAmount, isControlledToken } = useAtomValue(isControlledSwapStateAtom)

  const [, updateInputAmount] = useSwapAmount(Field.INPUT)
  const [, updateOutputAmount] = useSwapAmount(Field.OUTPUT)
  const [, updateInputCurrency] = useSwapCurrency(Field.INPUT)
  const [, updateOutputCurrency] = useSwapCurrency(Field.OUTPUT)

  useEffect(() => {
    if (isControlledAmount)
      independentField === Field.INPUT ? updateInputAmount(`${amount}`) : updateOutputAmount(`${amount}`)
    if (isControlledToken) {
      updateInputCurrency(inputToken)
      updateOutputCurrency(outputToken)
    }
  }, [
    independentField,
    amount,
    inputToken,
    outputToken,
    updateInputAmount,
    updateOutputAmount,
    updateInputCurrency,
    updateOutputCurrency,
    isControlledAmount,
    isControlledToken,
  ])
}
