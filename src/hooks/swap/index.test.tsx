import { TradeType } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { DAI, UNI, USDC_MAINNET } from 'constants/tokens'
import { useAtomValue } from 'jotai/utils'
import { Controlled, controlledAtom, Field, stateAtom, Swap, swapAtom } from 'state/swap'
import { renderHook } from 'test'

import { useSwapAmount, useSwapCurrency, useSwitchSwapCurrencies } from './'

const DAI_MAINNET = DAI
const UNI_MAINNET = UNI[SupportedChainId.MAINNET]

const INITIAL_SWAP: Swap = {
  independentField: Field.INPUT,
  amount: '42',
  [Field.INPUT]: DAI_MAINNET,
  [Field.OUTPUT]: USDC_MAINNET,
}

const INITIAL_CONTROLLED: Controlled = {
  ...INITIAL_SWAP,
  onAmountChange: () => void 0,
  onTokenChange: () => void 0,
  onSwitchTokens: () => void 0,
}

describe('swap state', () => {
  describe('useSwitchSwapCurrencies', () => {
    it('swaps swap state currencies', () => {
      const { rerender } = renderHook(
        () => {
          const switchSwapCurrencies = useSwitchSwapCurrencies()
          switchSwapCurrencies()
        },
        { initialAtomValues: [[stateAtom, INITIAL_SWAP]] }
      )

      const { result } = rerender(() => useAtomValue(swapAtom))
      expect(result.current).toMatchObject({
        ...INITIAL_SWAP,
        independentField: Field.OUTPUT,
        [Field.INPUT]: INITIAL_SWAP[Field.OUTPUT],
        [Field.OUTPUT]: INITIAL_SWAP[Field.INPUT],
      })
    })

    it('calls onSwitchTokens if present', () => {
      const spy = jest.fn()
      const { rerender } = renderHook(
        () => {
          const switchSwapCurrencies = useSwitchSwapCurrencies()
          switchSwapCurrencies()
        },
        {
          initialAtomValues: [
            [stateAtom, INITIAL_SWAP],
            [controlledAtom, { ...INITIAL_CONTROLLED, onSwitchTokens: spy }],
          ],
        }
      )
      expect(spy).toHaveBeenCalledWith({
        amount: INITIAL_SWAP.amount,
        type: TradeType.EXACT_OUTPUT,
        inputToken: INITIAL_SWAP[Field.OUTPUT],
        outputToken: INITIAL_SWAP[Field.INPUT],
      })

      const { result } = rerender(() => useAtomValue(swapAtom))
      expect(result.current).toMatchObject(INITIAL_SWAP)
    })
  })

  describe('useSwapCurrency', () => {
    it('sets currency', () => {
      const { rerender } = renderHook(
        () => {
          const [, setCurrency] = useSwapCurrency(Field.INPUT)
          setCurrency(UNI_MAINNET)
        },
        { initialAtomValues: [[stateAtom, INITIAL_SWAP]] }
      )

      const { result } = rerender(() => useAtomValue(swapAtom))
      expect(result.current).toMatchObject({ ...INITIAL_SWAP, [Field.INPUT]: UNI_MAINNET })
    })

    it('calls onTokenChange if present', () => {
      const spy = jest.fn()
      const { rerender } = renderHook(
        () => {
          const [, setCurrency] = useSwapCurrency(Field.INPUT)
          setCurrency(UNI_MAINNET)
        },
        {
          initialAtomValues: [
            [stateAtom, INITIAL_SWAP],
            [controlledAtom, { ...INITIAL_CONTROLLED, onTokenChange: spy }],
          ],
        }
      )
      expect(spy).toHaveBeenCalledWith(Field.INPUT, UNI_MAINNET)

      const { result } = rerender(() => useAtomValue(swapAtom))
      expect(result.current).toMatchObject(INITIAL_SWAP)
    })
  })

  describe('useSwapAmount', () => {
    it('sets currency amount', () => {
      const { rerender } = renderHook(
        () => {
          const [, setAmount] = useSwapAmount(Field.OUTPUT)
          setAmount('123')
        },
        { initialAtomValues: [[stateAtom, INITIAL_SWAP]] }
      )

      const { result } = rerender(() => useAtomValue(swapAtom))
      expect(result.current).toMatchObject({ ...INITIAL_SWAP, amount: '123', independentField: Field.OUTPUT })
    })

    it('calls onAmountChange if present', () => {
      const spy = jest.fn()
      const { rerender } = renderHook(
        () => {
          const [, setAmount] = useSwapAmount(Field.OUTPUT)
          setAmount('123')
        },
        {
          initialAtomValues: [
            [stateAtom, INITIAL_SWAP],
            [controlledAtom, { ...INITIAL_CONTROLLED, onAmountChange: spy }],
          ],
        }
      )
      expect(spy).toHaveBeenCalledWith(Field.OUTPUT, '123')

      const { result } = rerender(() => useAtomValue(swapAtom))
      expect(result.current).toMatchObject(INITIAL_SWAP)
    })
  })
})
