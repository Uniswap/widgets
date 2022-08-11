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
  inputTokenOnChange,
  outputToken,
  outputTokenOnChange,
  amount,
  amountOnChange,
  independentField,
  independentFieldOnChange,
  defaultTokenSelectorDisabled,
}: ControlledStateProps): IsControlledSwapState {
  return {
    isControlledAmount:
      amount !== undefined || Boolean(amountOnChange) || Boolean(independentField) || Boolean(independentFieldOnChange),
    isControlledToken:
      Boolean(inputToken) || Boolean(inputTokenOnChange) || Boolean(outputToken) || Boolean(outputTokenOnChange),
  }
}

export default function useSyncControlledStateProps(controlledStateProps: ControlledStateProps) {
  const {
    inputToken,
    inputTokenOnChange,
    outputToken,
    outputTokenOnChange,
    amount,
    amountOnChange,
    independentField,
    independentFieldOnChange,
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
