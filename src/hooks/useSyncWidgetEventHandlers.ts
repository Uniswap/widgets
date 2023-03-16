import { AddEthereumChainParameter, onSwitchChainAtom } from 'hooks/useSwitchChain'
import { useUpdateAtom } from 'jotai/utils'
import { ErrorInfo, useEffect } from 'react'
import { onConnectWalletClickAtom } from 'state/wallet'

export interface WidgetEventHandlers {
  onConnectWalletClick?: (chainId: number) => void | boolean | Promise<boolean>
  onError?: (error: Error, info?: ErrorInfo) => void
  onSwitchChain?: (addChainParameter: AddEthereumChainParameter) => void | Promise<void>
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
