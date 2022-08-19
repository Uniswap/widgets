import { atomWithReset } from 'jotai/utils'

import { pickAtom } from '../atoms'

interface Settings {
  autoSlippage: boolean // if true, slippage will use the default calculation
  maxSlippage: number | undefined // expressed as a percent
  transactionTtl: number | undefined
}

const initialSettings: Settings = {
  autoSlippage: true,
  maxSlippage: undefined,
  transactionTtl: undefined,
}

export const settingsAtom = atomWithReset(initialSettings)
export const autoSlippageAtom = pickAtom(settingsAtom, 'autoSlippage')
export const maxSlippageAtom = pickAtom(settingsAtom, 'maxSlippage')
export const transactionTtlAtom = pickAtom(settingsAtom, 'transactionTtl')
