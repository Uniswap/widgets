import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { onConnectWalletClickAtom } from 'state/wallet'

export type OnConnectWalletClick = () => void | Promise<boolean>

export interface WidgetEventHandlers {
  onConnectWalletClick?: OnConnectWalletClick
}

export default function useSyncWidgetEventHandlers({ onConnectWalletClick }: WidgetEventHandlers): void {
  const setOnConnectWalletClick = useUpdateAtom(onConnectWalletClickAtom)
  useEffect(
    () => setOnConnectWalletClick((old) => (old = onConnectWalletClick)),
    [onConnectWalletClick, setOnConnectWalletClick]
  )
}
