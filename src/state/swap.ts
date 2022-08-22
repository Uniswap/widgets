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

export const stateAtom = atomWithImmer<Swap>({
  independentField: Field.INPUT,
  amount: '',
  [Field.INPUT]: nativeOnChain(SupportedChainId.MAINNET),
})

export interface SwapController {
  type?: TradeType
  amount?: string
  inputToken?: Currency
  outputToken?: Currency
}

export const controlledAtom = atom<Swap | undefined>(undefined)

export const swapAtom = atom((get) => {
  const controlled = get(controlledAtom)
  return controlled ? controlled : get(stateAtom)
}, stateAtom.write)

// If set to a transaction hash, that transaction will display in a status dialog.
export const displayTxHashAtom = atom<string | undefined>(undefined)

export const feeOptionsAtom = atom<FeeOptions | undefined>(undefined)

/** An integration hook called when the user selects a new token. */
export type OnTokenChange = (field: Field, token: Currency) => void

/** An integration hook called when the user enters a new amount. */
export type OnAmountChange = (field: Field, amount: string) => void

/**
 * An integration hook called when the user switches the tokens.
 * The values represent already-switched state, to make it easier to update controlled state.
 */
export type OnSwitchTokens = (values: SwapController) => void

/**
 * An integration hook called when the user clicks 'Review swap'.
 * If the hook resolves to false or rejects, the review dialog will not open.
 */
export type OnReviewSwapClick = () => void | Promise<boolean>

/**
 * An integration hook called when the user clicks the token selector.
 * If the hook resolve to false or rejects, the token selector will not open.
 */
export type OnTokenSelectorClick = (field: Field) => void | Promise<boolean>

export interface SwapEventHandlers {
  onTokenChange?: OnTokenChange
  onAmountChange?: OnAmountChange
  onSwitchTokens?: OnSwitchTokens
  onReviewSwapClick?: OnReviewSwapClick
  onTokenSelectorClick?: OnTokenSelectorClick
}

export const swapEventHandlersAtom = atom<SwapEventHandlers>({})
