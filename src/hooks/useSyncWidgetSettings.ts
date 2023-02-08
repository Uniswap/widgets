import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
export type { OnError } from 'components/Error/ErrorBoundary'
export type { AddEthereumChainParameter, OnSwitchChain } from 'hooks/useSwitchChain'
export type { OnConnectWalletClick } from 'state/wallet'

export const widgetSettingsAtom = atom<WidgetSettings>({})

export interface WidgetSettings {
  testnetsVisible?: boolean
}

export default function useSyncWidgetSettings({ testnetsVisible }: WidgetSettings): void {
  const updateWidgetSettingsAtom = useUpdateAtom(widgetSettingsAtom)
  useEffect(() => {
    updateWidgetSettingsAtom({ testnetsVisible })
  }, [updateWidgetSettingsAtom, testnetsVisible])
}

export function useTestnetsVisible() {
  return useAtomValue(widgetSettingsAtom).testnetsVisible ?? false
}
