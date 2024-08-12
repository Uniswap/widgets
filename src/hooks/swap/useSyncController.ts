import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { controlledAtom as controlledSwapAtom, Swap } from 'state/swap'
import { stateAtom as controlledSettingsAtom, Settings } from 'state/swap/settings'

export interface SwapController {
  value?: Swap
  settings?: Settings
}

export default function useSyncController({ value, settings }: SwapController): void {
  // Log an error if the component changes from uncontrolled to controlled (or vice versa).
  const isSwapControlled = useRef(Boolean(value))
  const isSettingsControlled = useRef(Boolean(settings))
  const [controlledSettings, setControlledSettings] = useAtom(controlledSettingsAtom)

  useEffect(() => {
    // only set settings on mount - otherwise settings are being reset to default after every change in UI
    setControlledSettings(settings as Settings)
  },[])

  useEffect(() => {
    if (Boolean(value) !== isSwapControlled.current) {
      warnOnControlChange({ state: 'swap', prop: 'value' })
    }
    if (Boolean(settings) !== isSettingsControlled.current) {
      warnOnControlChange({ state: 'settings', prop: 'settings' })
    }
  }, [settings, value])

  const [controlledSwap, setControlledSwap] = useAtom(controlledSwapAtom)
  if (controlledSwap !== value) {
    setControlledSwap(value)
  }
}

function warnOnControlChange({ state, prop }: { state: string; prop: string }) {
  console.error(
    `Warning: The SwapWidget component's ${state} state (controlled by the '${prop}' prop) is changing from uncontrolled to controlled (or vice versa). This should not happen. Decide between using a controlled or uncontrolled state for the lifetime of the component.`
  )
}
