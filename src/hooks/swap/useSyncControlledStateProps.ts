import { Currency } from '@uniswap/sdk-core'
import { useEffect } from 'react'
import { Field } from 'state/swap'
import { useSwapAmount, useSwapCurrency } from 'hooks/swap'

import useOnSupportedNetwork from '../useOnSupportedNetwork'

export interface ControlledStateProps {
  inputToken?: Currency
  inputTokenOnChange?: (t: Currency) => void
  inputTokenSelectorActive?: boolean

  outputToken?: Currency
  outputTokenOnChange?: (t: Currency) => void
  outputTokenSelectorActive?: boolean

  inputTokenAmount?: string | number // BigIntIsh? which = JSBI | string | number
  inputTokenAmountOnChange: (n: string) => void

  outputTokenAmount?: string | number // BigIntIsh?
  outputTokenAmountOnChange?: (n: string) => void
}

export function isControlledComponent({
  inputToken,
  inputTokenOnChange,
  inputTokenSelectorActive,
  outputToken,
  outputTokenOnChange,
  outputTokenSelectorActive,
  inputTokenAmount,
  inputTokenAmountOnChange,
  outputTokenAmount,
  outputTokenAmountOnChange,
}: ControlledStateProps): boolean {
  const controlledStateProps = {
    inputToken,
    inputTokenOnChange,
    inputTokenSelectorActive,
    outputToken,
    outputTokenOnChange,
    outputTokenSelectorActive,
    inputTokenAmount,
    inputTokenAmountOnChange,
    outputTokenAmount,
    outputTokenAmountOnChange,
  }
  let controlledPropCount = 0
  Object.keys(controlledStateProps).forEach((key) => {
    if (controlledStateProps[key as keyof typeof controlledStateProps] !== undefined) controlledPropCount++
  })
  return Boolean(controlledPropCount)
}

export default function useSyncControlledStateProps(controlledStateProps: ControlledStateProps) {
  const {
    inputToken,
    inputTokenOnChange,
    inputTokenSelectorActive,
    outputToken,
    outputTokenOnChange,
    outputTokenSelectorActive,
    inputTokenAmount,
    inputTokenAmountOnChange,
    outputTokenAmount,
    outputTokenAmountOnChange,
  } = controlledStateProps

  // fixme handle for onChange fxns and selectorActive
  const [, updateInputAmount] = useSwapAmount(Field.INPUT)
  const [, updateOutputAmount] = useSwapAmount(Field.OUTPUT)
  const [, updateInputCurrency] = useSwapCurrency(Field.INPUT)
  const [, updateOutputCurrency] = useSwapCurrency(Field.OUTPUT)

  useEffect(() => {
    inputTokenAmount && updateInputAmount(`${inputTokenAmount}`)
    outputTokenAmount && updateOutputAmount(`${outputTokenAmount}`)
    inputToken && updateInputCurrency(inputToken)
    outputToken && updateOutputCurrency(outputToken)
  }, [inputTokenAmount, outputTokenAmount, inputToken, outputToken])

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
