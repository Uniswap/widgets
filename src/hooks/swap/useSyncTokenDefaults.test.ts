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
      const { rerender } = renderHook(
        (defaultTokens) => {
          console.log('HELLO THERE', defaultTokens)
          useSyncTokenDefaults(defaultTokens)
        },
        { initialProps: defaultTokens }
      )

      rerender(newDefaultTokens)

      console.log('HERES WHAT I HAVE', swap.current)
      expect(swap.current.INPUT).toEqual(defaultInputToken)
      expect(swap.current.independentField).toEqual(Field.OUTPUT)
      expect(swap.current.OUTPUT).toBeDefined()
      expect(swap.current.OUTPUT.equals(newOutputToken.current))
      expect(swap.current.amount).toEqual(newOutputAmount)
    })
    // it('throws error if only amount given without token address', () => {
    // })
    // it('returns false if has receipt and never checked', () => {
    // })
    // it('returns false if has receipt and never checked', () => {
    // })
    // it('returns false if has receipt and never checked', () => {
    // })
    // it('returns false if has receipt and never checked', () => {
    // })
  })
})
// describe('transactions updater', () => {
//   describe('shouldCheck', () => {
//     it('returns true if no receipt and never checked', () => {
//       expect(shouldCheck(10, { addedTime: 100 })).toEqual(true)
//     })
//     it('returns false if has receipt and never checked', () => {
//       expect(shouldCheck(10, { addedTime: 100, receipt: {} })).toEqual(false)
//     })
//     it('returns true if has not been checked in 1 blocks', () => {
//       expect(shouldCheck(10, { addedTime: new Date().getTime(), lastCheckedBlockNumber: 9 })).toEqual(true)
//     })
//     it('returns false if checked in last 3 blocks and greater than 20 minutes old', () => {
//       expect(shouldCheck(10, { addedTime: new Date().getTime() - 21 * 60 * 1000, lastCheckedBlockNumber: 8 })).toEqual(
//         false
//       )
//     })
//     it('returns true if not checked in last 5 blocks and greater than 20 minutes old', () => {
//       expect(shouldCheck(10, { addedTime: new Date().getTime() - 21 * 60 * 1000, lastCheckedBlockNumber: 5 })).toEqual(
//         true
//       )
//     })
//     it('returns false if checked in last 10 blocks and greater than 60 minutes old', () => {
//       expect(shouldCheck(20, { addedTime: new Date().getTime() - 61 * 60 * 1000, lastCheckedBlockNumber: 11 })).toEqual(
//         false
//       )
//     })
//     it('returns true if checked in last 3 blocks and greater than 20 minutes old', () => {
//       expect(shouldCheck(20, { addedTime: new Date().getTime() - 61 * 60 * 1000, lastCheckedBlockNumber: 10 })).toEqual(
//         true
//       )
//     })
//   })
// })
