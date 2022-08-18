import { Currency, TradeType } from '@uniswap/sdk-core'
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

const stateAtom = atomWithImmer<Swap>({
  independentField: Field.INPUT,
  amount: '',
  [Field.INPUT]: nativeOnChain(SupportedChainId.MAINNET),
})

export interface ControlledValues {
  type?: TradeType
  amount?: string
  inputToken?: Currency
  outputToken?: Currency
}

export interface ControllerHandlers {
  onTokenChange: (field: Field, token: Currency) => void
  onAmountChange: (field: Field, amount: string) => void
  onSwitchTokens: (values: ControlledValues) => void
}

export interface Controlled extends Swap, ControllerHandlers {}

export const controlledAtom = atom<Controlled | undefined>(undefined)

export const swapAtom = atom((get) => {
  const controlled = get(controlledAtom)
  return controlled ? controlled : get(stateAtom)
}, stateAtom.write)

// If set, allows integrator to add behavior when 'Review swap' button is clicked
export const onReviewSwapClickAtom = atom<(() => void | Promise<boolean>) | undefined>(undefined)

// If set, allows integrator to add behavior when the token selector is clicked
export const onTokenSelectorClickAtom = atom<((field: Field) => void | Promise<boolean>) | undefined>(undefined)

// If set to a transaction hash, that transaction will display in a status dialog.
export const displayTxHashAtom = atom<string | undefined>(undefined)

export const feeOptionsAtom = atom<FeeOptions | undefined>(undefined)
