import { TradeType } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { DAI, UNI, USDC_MAINNET } from 'constants/tokens'
import { useAtomValue } from 'jotai/utils'
import { controlledAtom, Field, stateAtom, Swap, swapAtom, swapEventHandlersAtom } from 'state/swap'
import { act, renderHook } from 'test'

import { useSwapAmount, useSwapCurrency, useSwitchSwapCurrencies } from './'

const DAI_MAINNET = DAI
const UNI_MAINNET = UNI[SupportedChainId.MAINNET]

const INITIAL_SWAP: Swap = {
  type: TradeType.EXACT_INPUT,
  amount: '42',
  [Field.INPUT]: DAI_MAINNET,
  [Field.OUTPUT]: USDC_MAINNET,
}

describe('swap state', () => {
  describe('useSwitchSwapCurrencies', () => {
    it('swaps currencies', () => {
      const spy = jest.fn()
      const { result } = renderHook(
        () => ({
          switchCurrencies: useSwitchSwapCurrencies(),
          swap: useAtomValue(swapAtom),
        }),
        {
          initialAtomValues: [
            [stateAtom, INITIAL_SWAP],
            [swapEventHandlersAtom, { onSwitchTokens: spy }],
          ],
        }
      )
      act(result.current.switchCurrencies)
      expect(spy).toHaveBeenCalled()
      expect(result.current.swap).toMatchObject({
        ...INITIAL_SWAP,
        type: TradeType.EXACT_OUTPUT,
        [Field.INPUT]: INITIAL_SWAP[Field.OUTPUT],
        [Field.OUTPUT]: INITIAL_SWAP[Field.INPUT],
      })
    })

    it('does not swap if controlled', () => {
      const spy = jest.fn()
      const { result } = renderHook(
        () => ({
          switchCurrencies: useSwitchSwapCurrencies(),
          swap: useAtomValue(swapAtom),
        }),
        {
          initialAtomValues: [
            [stateAtom, INITIAL_SWAP],
            [swapEventHandlersAtom, { onSwitchTokens: spy }],
            [controlledAtom, INITIAL_SWAP],
          ],
        }
      )
      act(result.current.switchCurrencies)
      expect(spy).toHaveBeenCalled()
      expect(result.current.swap).toMatchObject(INITIAL_SWAP)
    })
  })

  describe('useSwapCurrency', () => {
    it('sets currency', () => {
      const spy = jest.fn()
      const { result } = renderHook(
        () => {
          const [, setCurrency] = useSwapCurrency(Field.INPUT)
          setCurrency(UNI_MAINNET)
          return useAtomValue(swapAtom)
        },
        {
          initialAtomValues: [
            [stateAtom, INITIAL_SWAP],
            [swapEventHandlersAtom, { onTokenChange: spy }],
          ],
        }
      )
      expect(spy).toHaveBeenCalledWith(Field.INPUT, UNI_MAINNET)
      expect(result.current).toMatchObject({ ...INITIAL_SWAP, [Field.INPUT]: UNI_MAINNET })
    })

    it('does not set currency if controlled', () => {
      const spy = jest.fn()
      const { result } = renderHook(
        () => {
          const [, setCurrency] = useSwapCurrency(Field.INPUT)
          setCurrency(UNI_MAINNET)
          return useAtomValue(swapAtom)
        },
        {
          initialAtomValues: [
            [stateAtom, INITIAL_SWAP],
            [swapEventHandlersAtom, { onTokenChange: spy }],
            [controlledAtom, INITIAL_SWAP],
          ],
        }
      )
      expect(spy).toHaveBeenCalledWith(Field.INPUT, UNI_MAINNET)
      expect(result.current).toMatchObject(INITIAL_SWAP)
    })
  })

  describe('useSwapAmount', () => {
    it('sets currency amount', () => {
      const spy = jest.fn()
      const { result } = renderHook(
        () => {
          const [, setAmount] = useSwapAmount(Field.OUTPUT)
          setAmount('123')
          return useAtomValue(swapAtom)
        },
        {
          initialAtomValues: [
            [stateAtom, INITIAL_SWAP],
            [swapEventHandlersAtom, { onAmountChange: spy }],
          ],
        }
      )
      expect(spy).toHaveBeenCalledWith(Field.OUTPUT, '123', undefined)
      expect(result.current).toMatchObject({ ...INITIAL_SWAP, amount: '123', type: TradeType.EXACT_OUTPUT })
    })

    it('calls onAmountChange if present', () => {
      const spy = jest.fn()
      const { result } = renderHook(
        () => {
          const [, setAmount] = useSwapAmount(Field.OUTPUT)
          setAmount('123')
          return useAtomValue(swapAtom)
        },
        {
          initialAtomValues: [
            [stateAtom, INITIAL_SWAP],
            [swapEventHandlersAtom, { onAmountChange: spy }],
            [controlledAtom, INITIAL_SWAP],
          ],
        }
      )
      expect(spy).toHaveBeenCalledWith(Field.OUTPUT, '123', undefined)
      expect(result.current).toMatchObject(INITIAL_SWAP)
    })
  })
})
