import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'
import { swapEventHandlersAtom } from 'state/swap'
import { PerfEventHandlers } from 'state/swap/perf'

export function usePerfHandler<
  K extends keyof PerfEventHandlers,
  P extends Parameters<NonNullable<PerfEventHandlers[K]>>,
  A extends P[0],
  E extends Awaited<P[1]>,
  H extends PerfEventHandlers[K] & ((args: A, event: Promise<E>) => void)
>(name: K, callback: () => Promise<E>, args?: A): () => Promise<E> {
  const perfHandler = useAtomValue(swapEventHandlersAtom)[name] as H
  return useCallback(() => {
    const event = Promise.resolve().then(callback)
    if (args) {
      perfHandler?.(args, event)
    }
    return event
  }, [args, callback, perfHandler])
}
