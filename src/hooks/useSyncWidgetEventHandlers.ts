import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { onConnectWalletClickAtom } from 'state/wallet'

export interface WidgetEventHandlers {
  onConnectWalletClick?: () => void | Promise<boolean>
}

export default function useSyncWidgetEventHandlers({ onConnectWalletClick }: WidgetEventHandlers): void {
  const setOnConnectWalletClick = useUpdateAtom(onConnectWalletClickAtom)
  useEffect(
    () => setOnConnectWalletClick((old) => (old = onConnectWalletClick)),
    [onConnectWalletClick, setOnConnectWalletClick]
  )
}
