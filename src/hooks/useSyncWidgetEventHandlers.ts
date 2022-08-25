import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { OnConnectWalletClick, onConnectWalletClickAtom } from 'state/wallet'
export type { OnConnectWalletClick } from 'state/wallet'

export interface WidgetEventHandlers {
  onConnectWalletClick?: OnConnectWalletClick
}

export default function useSyncWidgetEventHandlers({ onConnectWalletClick }: WidgetEventHandlers): void {
  const setOnConnectWalletClick = useUpdateAtom(onConnectWalletClickAtom)
  useEffect(() => setOnConnectWalletClick(onConnectWalletClick), [onConnectWalletClick, setOnConnectWalletClick])
}
