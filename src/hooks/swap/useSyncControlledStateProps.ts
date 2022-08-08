import { Currency } from '@uniswap/sdk-core'
import { useSwapAmount, useSwapCurrency } from 'hooks/swap'
import { useAtomValue } from 'jotai/utils'
import { am } from 'make-plural'
import { useEffect } from 'react'
import { Field, IsControlledSwapState, isControlledSwapStateAtom, OnSwapChangeCallbacks } from 'state/swap'

export interface ControlledStateProps extends OnSwapChangeCallbacks {
  inputToken?: Currency
  outputToken?: Currency
  // inputTokenAmount?: string | number // BigIntIsh? which = JSBI | string | number
  // outputTokenAmount?: string | number // BigIntIsh?
  amount?: string | number
  independentField?: Field

  defaultTokenSelectorDisabled?: boolean
}

// export function getControlledPropCount({
//   inputToken,
//   inputTokenOnChange,
//   outputToken,
//   outputTokenOnChange,
//   amount,
//   amountOnChange,
//   independentField,
//   independentFieldOnChange,
//   defaultTokenSelectorDisabled,
// }: ControlledStateProps) {
//   const controlledStateProps = {
//     inputToken,
//     inputTokenOnChange,
//     outputToken,
//     outputTokenOnChange,
//     amount,
//     amountOnChange,
//     independentField,
//     independentFieldOnChange,
//     defaultTokenSelectorDisabled,
//   }
//   let controlledPropCount = 0
//   Object.keys(controlledStateProps).forEach((key) => {
//     if (controlledStateProps[key as keyof typeof controlledStateProps] !== undefined) controlledPropCount++
//   })
//   return controlledPropCount
// }

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

  console.log('use sync  controlled amt', amount)
  const { isControlledAmount, isControlledToken } = useAtomValue(isControlledSwapStateAtom)

  // fixme handle for onChange fxns and selectorActive
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

  // const setToDefaults = useCallback(() => {
  //   const newSwapState: Swap = {
  //     independentField: Field.INPUT,
  //     amount: '',
  //   }
  //   if (inputToken && inputAmount) {
  //     newSwapState.amount = inputAmount.toString()
  //   } else if (outputToken && outputTokenAmount) {
  //     newSwapState.independentField = Field.OUTPUT
  //     newSwapState.amount = outputTokenAmount.toString()
  //   }
  //   updateSwap((swap) => ({ ...swap, ...newSwapState }))
  // }, [inputAmount, inputToken, outputTokenAmount, outputToken, updateSwap])

  // const lastChainId = useRef<number | undefined>(undefined)
  // const isTokenListLoaded = useIsTokenListLoaded()
  // useEffect(() => {
  //   const shouldSync = isTokenListLoaded && chainId && chainId !== lastChainId.current
  //   if (shouldSync) {
  //     setToDefaults()
  //     lastChainId.current = chainId
  //   }
  // }, [isTokenListLoaded, chainId, setToDefaults])
}
