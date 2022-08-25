import { Currency, TradeType } from '@uniswap/sdk-core'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useRef } from 'react'
import { controlledAtom as swapAtom, Field, Swap } from 'state/swap'
import { controlledAtom as settingsAtom, Settings } from 'state/swap/settings'

export type SwapSettingsController = Settings

export interface SwapController {
  type?: TradeType
  amount?: string
  [Field.INPUT]?: Currency
  [Field.OUTPUT]?: Currency
}

export default function useSyncController({
  value,
  settings,
}: {
  value?: SwapController
  settings?: SwapSettingsController
}): void {
  // Log an error if the component changes from uncontrolled to controlled (or vice versa).
  const isSwapControlled = useRef(Boolean(value))
  const isSettingsControlled = useRef(Boolean(settings))
  useEffect(() => {
    if (Boolean(value) !== isSwapControlled.current) {
      warnOnControlChange({ state: 'swap', prop: 'value' })
    }
    if (Boolean(settings) !== isSettingsControlled.current) {
      warnOnControlChange({ state: 'settings', prop: 'settings' })
    }
  }, [settings, value])

  const setSwap = useUpdateAtom(swapAtom)
  useEffect(() => setSwap(toSwap(value)), [value, setSwap])
  const setSettings = useUpdateAtom(settingsAtom)
  useEffect(() => setSettings(settings), [settings, setSettings])
}

function toSwap(value?: SwapController): Swap | undefined {
  if (!value) return undefined

  return {
    ...value,
    independentField: value.type === TradeType.EXACT_INPUT ? Field.INPUT : Field.OUTPUT,
    amount: value.amount || '',
  }
}

function warnOnControlChange({ state, prop }: { state: string; prop: string }) {
  console.error(
    `Warning: The SwapWidget component's ${state} state (controlled by the '${prop}' prop) is changing from uncontrolled to controlled (or vice versa). This should not happen. Decide between using a controlled or uncontrolled state for the lifetime of the component.`
  )
}
