import { TradeType } from '@uniswap/sdk-core'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo, useRef } from 'react'
import { controlledAtom, Field, Swap, SwapController } from 'state/swap'
export type { SwapController } from 'state/swap'

export default function useSyncController({ type, amount, inputToken, outputToken }: SwapController): void {
  const controlled = useMemo<Swap | undefined>(() => {
    if ([type, amount, inputToken, outputToken].every((prop) => prop === undefined)) {
      // Component is uncontrolled
      return undefined
    }

    // Component is controlled
    return {
      independentField: type === TradeType.EXACT_INPUT ? Field.INPUT : Field.OUTPUT,
      amount: amount || '',
      [Field.INPUT]: inputToken,
      [Field.OUTPUT]: outputToken,
    }
  }, [amount, inputToken, outputToken, type])

  // Log an error if the component changes from uncontrolled to controlled (or vice versa).
  const isControlled = useRef(Boolean(controlled))
  useEffect(() => {
    if (Boolean(controlled) !== isControlled.current) {
      const article = (isControlled: boolean) => (isControlled ? 'a ' : 'an un')
      console.error(
        `Warning: The SwapWidget component is changing from ${article(
          isControlled.current
        )}controlled component to ${article(
          Boolean(controlled)
        )}controlled component. The SwapWidget should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled SwapWidget for the lifetime of the component.`
      )
    }
    isControlled.current = Boolean(controlled)
  }, [controlled])

  const setControlled = useUpdateAtom(controlledAtom)
  useEffect(() => setControlled((old) => (old = controlled)), [controlled, setControlled])
}
