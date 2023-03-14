import { TradeResult } from 'state/routing/types'
import { swapEventHandlersAtom } from 'state/swap'
import { PerfEventHandlers } from 'state/swap/perf'
import { renderHook } from 'test'

import { usePerfEventHandler } from './usePerfEventHandler'

describe('usePerfEventHandler', () => {
  const onSwapQuote = jest.fn()
  const callback = jest.fn()
  const tradeResult = {} as TradeResult

  beforeEach(() => {
    onSwapQuote.mockReset()
    callback.mockReset().mockReturnValue(tradeResult)
  })

  describe('with a perfHandler', () => {
    describe('with args', () => {
      it('returns a callback returning the event, wrapped by the perfHandler', async () => {
        const args = {} as Parameters<NonNullable<PerfEventHandlers['onSwapQuote']>>[0]
        const { result } = renderHook(() => usePerfEventHandler('onSwapQuote', args, callback), {
          initialAtomValues: [[swapEventHandlersAtom, { onSwapQuote }]],
        })
        expect(result.current).toBeInstanceOf(Function)
        await expect(result.current()).resolves.toBe(tradeResult)

        // The execution of the callback should be deferred until after the perfHandler has executed.
        // This ensures that the perfHandler can capture the beginning of the callback's execution.
        expect(onSwapQuote).toHaveBeenCalledBefore(callback)
        expect(onSwapQuote).toHaveBeenCalledWith(args, expect.any(Promise))
        expect(onSwapQuote.mock.calls[0][1]).resolves.toBe(tradeResult)
      })
    })

    describe('without args', () => {
      it('returns a callback returning the event, without calling perfHandler', async () => {
        const { result } = renderHook(() => usePerfEventHandler('onSwapQuote', undefined, callback), {
          initialAtomValues: [[swapEventHandlersAtom, { onSwapQuote }]],
        })
        expect(result.current).toBeInstanceOf(Function)
        await expect(result.current()).resolves.toBe(tradeResult)
        expect(onSwapQuote).not.toHaveBeenCalled()
      })
    })
  })

  describe('without a perfHandler', () => {
    it('returns a callback returning the event', async () => {
      const { result } = renderHook(() => usePerfEventHandler('onSwapQuote', undefined, callback))
      expect(result.current).toBeInstanceOf(Function)
      await expect(result.current()).resolves.toBe(tradeResult)
    })
  })
})
