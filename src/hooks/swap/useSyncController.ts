import { Atom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useRef } from 'react'
import { controlledAtom as swapAtom, Swap } from 'state/swap'
import { controlledAtom as settingsAtom, Settings } from 'state/swap/settings'

export interface SwapController {
  value?: Swap
  settings?: Settings
}

export function useInitialController({ value }: SwapController): [Atom<Swap | undefined>, Swap | undefined] {
  return [swapAtom, value]
}

export default function useSyncController({ value, settings }: SwapController): void {
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
  setSwap(() => value)

  const setSettings = useUpdateAtom(settingsAtom)
  setSettings(() => settings)
}

function warnOnControlChange({ state, prop }: { state: string; prop: string }) {
  console.error(
    `Warning: The SwapWidget component's ${state} state (controlled by the '${prop}' prop) is changing from uncontrolled to controlled (or vice versa). This should not happen. Decide between using a controlled or uncontrolled state for the lifetime of the component.`
  )
}
