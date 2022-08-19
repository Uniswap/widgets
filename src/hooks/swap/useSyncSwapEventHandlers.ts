import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { SwapEventHandlers, swapEventHandlersAtom } from 'state/swap'
export type { SwapEventHandlers } from 'state/swap'

export default function useSyncSwapEventHandlers(handlers: SwapEventHandlers): void {
  const setSwapEventHandlersAtom = useUpdateAtom(swapEventHandlersAtom)
  useEffect(() => setSwapEventHandlersAtom(handlers), [handlers, setSwapEventHandlersAtom])
}
