import { Currency } from '@uniswap/sdk-core'
import { FeeOptions } from '@uniswap/v3-sdk'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { atom } from 'jotai'
import { atomWithImmer } from 'jotai/immer'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export interface Swap {
  independentField: Field
  amount: string
  [Field.INPUT]?: Currency
  [Field.OUTPUT]?: Currency
}

export const swapAtom = atomWithImmer<Swap>({
  independentField: Field.INPUT,
  amount: '',
  [Field.INPUT]: nativeOnChain(SupportedChainId.MAINNET),
})

export interface IsControlledSwapState {
  isControlledAmount?: boolean
  isControlledToken?: boolean
}

export const isControlledSwapStateAtom = atom<IsControlledSwapState>({
  isControlledAmount: false,
  isControlledToken: false,
})
export interface OnSwapChangeCallbacks {
  inputTokenOnChange?: (t: Currency) => void
  outputTokenOnChange?: (t: Currency) => void
  amountOnChange?: (n: string) => void
  independentFieldOnChange?: (f: Field) => void
}

export const onSwapChangeCallbacksAtom = atom<OnSwapChangeCallbacks>({
  inputTokenOnChange: undefined,
  outputTokenOnChange: undefined,
  amountOnChange: undefined,
  independentFieldOnChange: undefined,
})

export const defaultTokenSelectorDisabledAtom = atom<boolean>(false)

// If set to a transaction hash, that transaction will display in a status dialog.
export const displayTxHashAtom = atom<string | undefined>(undefined)

export const feeOptionsAtom = atom<FeeOptions | undefined>(undefined)
