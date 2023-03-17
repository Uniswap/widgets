import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'
import { swapEventHandlersAtom } from 'state/swap'
import { PerfEventHandlers } from 'state/swap/perf'

/**
 * PerfEventHandlers all take two arguments: args and event.
 * This wraps those arguments so that the handler is called before the event is executed, for more accurate instrumentation.
 */
export function usePerfEventHandler<
  Key extends keyof PerfEventHandlers,
  Params extends Parameters<NonNullable<PerfEventHandlers[Key]>>,
  Args extends Params[0],
  Event extends Params[1] & Promise<Awaited<Params[1]>>,
  Handler extends PerfEventHandlers[Key] & ((args: Args, event: Event) => void)
>(name: Key, args: Args | undefined, callback: () => Event): () => Event {
  const perfHandler = useAtomValue(swapEventHandlersAtom)[name] as Handler
  return useCallback(() => {
    // Use Promise.resolve().then to defer the execution of the callback until after the perfHandler has executed.
    // This ensures that the perfHandler can capture the beginning of the callback's execution.
    const event = Promise.resolve().then(callback) as Event
    if (args) {
      perfHandler?.(args, event)
    }
    return event
  }, [args, callback, perfHandler])
}
