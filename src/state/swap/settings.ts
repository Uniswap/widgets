import { RouterPreference } from 'hooks/routing/types'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

import { pickAtom } from '../atoms'

export interface Slippage {
  auto: boolean // if true, slippage will use the default calculation
  max: string | undefined // expressed as a percent (eg '0.42' is 0.42%)
}

export interface Settings {
  slippage: Slippage
  transactionTtl: number | undefined
  routerPreference: RouterPreference
}

const initialSettings: Settings = {
  slippage: { auto: true, max: undefined },
  transactionTtl: undefined,

  // Set to API by default so that if the consumer passes in the `routerUrl` prop, it is
  // automatically set to use that url. Otherwise, it will fallback to client side routing.
  routerPreference: RouterPreference.API,
}

export const controlledAtom = atom<Settings | undefined>(undefined)
export const stateAtom = atomWithReset(initialSettings)
export const settingsAtom = atom((get) => {
  const controlled = get(controlledAtom)
  return controlled ? controlled : get(stateAtom)
}, stateAtom.write)

export const slippageAtom = pickAtom(settingsAtom, 'slippage')
export const transactionTtlAtom = pickAtom(settingsAtom, 'transactionTtl')
export const routerPreferenceAtom = pickAtom(settingsAtom, 'routerPreference')

/** An integration hook called when the user resets settings. */
export type OnSettingsReset = () => void

/** An integration hook called when the user changes slippage settings. */
export type OnSlippageChange = (slippage: Slippage) => void

/** An integration hook called when the user changes transaction deadline settings. */
export type OnTransactionDeadlineChange = (ttl: number | undefined) => void

export type OnRouterPreferenceChange = (routerPreference: RouterPreference) => void

export interface SettingsEventHandlers {
  onSettingsReset?: OnSettingsReset
  onSlippageChange?: OnSlippageChange
  onTransactionDeadlineChange?: OnTransactionDeadlineChange
  onRouterPreferenceChange?: OnRouterPreferenceChange
}
