import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { swapRouterUrlAtom } from 'state/swap'
export type { SwapEventHandlers } from 'state/swap'

export default function useSyncSwapRouterUrl(routerUrl?: string): void {
  const setSwapRouterUrlAtom = useUpdateAtom(swapRouterUrlAtom)
  useEffect(() => setSwapRouterUrlAtom(routerUrl), [routerUrl, setSwapRouterUrlAtom])
}
