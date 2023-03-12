import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'
import { swapEventHandlersAtom } from 'state/swap'
import { PerfEventHandlers } from 'state/swap/perf'

export function usePerfEventHandler<
  K extends keyof PerfEventHandlers,
  P extends Parameters<NonNullable<PerfEventHandlers[K]>>,
  A extends P[0],
  E extends Awaited<P[1]>,
  H extends PerfEventHandlers[K] & ((args: A, event: Promise<E>) => void)
>(name: K, callback: () => Promise<E>, args?: A): () => Promise<E> {
  const perfHandler = useAtomValue(swapEventHandlersAtom)[name] as H
  return useCallback(() => {
    // Use Promise.resolve().then to defer the execution of the callback until after the perfHandler has executed.
    // This ensures that the perfHandler can capture the beginning of the callback's execution.
    const event = Promise.resolve().then(callback)
    if (args) {
      perfHandler?.(args, event)
    }
    return event
  }, [args, callback, perfHandler])
}
