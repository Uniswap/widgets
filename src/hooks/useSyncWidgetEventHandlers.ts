import { OnError } from 'components/Error/ErrorBoundary'
import { OnSwitchChain, onSwitchChainAtom } from 'hooks/useSwitchChain'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { OnConnectWalletClick, onConnectWalletClickAtom } from 'state/wallet'
export type { OnError } from 'components/Error/ErrorBoundary'
export type { AddEthereumChainParameter, OnSwitchChain } from 'hooks/useSwitchChain'
export type { OnConnectWalletClick } from 'state/wallet'

export interface WidgetEventHandlers {
  onConnectWalletClick?: OnConnectWalletClick
  onError?: OnError
  onSwitchChain?: OnSwitchChain
}

export default function useSyncWidgetEventHandlers({ onConnectWalletClick, onSwitchChain }: WidgetEventHandlers): void {
  const setOnConnectWalletClick = useUpdateAtom(onConnectWalletClickAtom)
  useEffect(() => {
    setOnConnectWalletClick(() => onConnectWalletClick)
  }, [onConnectWalletClick, setOnConnectWalletClick])

  const setOnSwitchChain = useUpdateAtom(onSwitchChainAtom)
  useEffect(() => {
    setOnSwitchChain(() => onSwitchChain)
  }, [onSwitchChain, setOnSwitchChain])
}
