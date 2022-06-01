import { renderHook } from '@testing-library/react-hooks/dom'
import { Token } from '@uniswap/sdk-core'
import { useAtomValue } from 'jotai/utils'

import { useToken } from '../../hooks/useCurrency'
import { Field, swapAtom } from '../../state/swap'
import useSyncTokenDefaults from './useSyncTokenDefaults'

describe('tokens defaults changed', () => {
  describe('swap should be updated', () => {
    it('updates swap when default outputs are changed', () => {
      const { result: swap } = renderHook(() => useAtomValue(swapAtom))
      const defaultInputToken = swap.current.INPUT
      const defaultInputTokenAddress = defaultInputToken.isNative ? 'NATIVE' : (defaultInputToken as Token).address
      const defaultInputAmount = swap.current.amount
      const defaultOutputToken = swap.current.OUTPUT
      const defaultIndependentField = swap.current.independentField
      const defaultTokens = {
        defaultInputTokenAddress,
        defaultInputAmount,
        defaultOutputTokenAddress: undefined,
        defaultOutputAmount: '',
      }

      // swap using default tokens
      // fixme: does not run useEffect hooks in `useSyncTokenDefaults`. why?
      const { rerender } = renderHook(
        (defaultTokens) => {
          useSyncTokenDefaults(defaultTokens)
        },
        { initialProps: defaultTokens }
      )

      // re-render with new input/output tokens
      const newInputTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      const newOutputTokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
      const { result: newOutputToken } = renderHook(() => useToken(newOutputTokenAddress))
      const newOutputAmount = '50'
      const newDefaultTokens = {
        defaultInputTokenAddress: newInputTokenAddress,
        defaultInputAmount: '',
        defaultOutputTokenAddress: newOutputTokenAddress,
        defaultOutputAmount: newOutputAmount,
      }
      rerender(newDefaultTokens)

      // expect that swap has changed
      expect(swap.current.INPUT).toEqual(defaultInputToken)
      expect(swap.current.independentField).toEqual(Field.OUTPUT)
      expect(swap.current.OUTPUT).toBeDefined()
      expect(swap.current.OUTPUT.equals(newOutputToken.current))
      expect(swap.current.amount).toEqual(newOutputAmount)
    })
  })
})
