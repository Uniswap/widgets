import { Web3Provider } from '@ethersproject/providers'
import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { Signer } from 'starknet'
export type { OnError } from 'components/Error/ErrorBoundary'
export type { AddEthereumChainParameter, OnSwitchChain } from 'hooks/useSwitchChain'
export type { OnConnectWalletClick } from 'state/wallet'

export const widgetSettingsAtom = atom<WidgetSettings>({})

export interface WidgetSettings {
  ethProvider?: Web3Provider
  snSigner?: Signer
  testnetsVisible?: boolean
}

export default function useSyncWidgetSettings({ testnetsVisible, ethProvider, snSigner }: WidgetSettings): void {
  const updateWidgetSettingsAtom = useUpdateAtom(widgetSettingsAtom)
  useEffect(() => {
    updateWidgetSettingsAtom({ testnetsVisible, ethProvider, snSigner })
  }, [updateWidgetSettingsAtom, testnetsVisible, ethProvider, snSigner])
}

export function useTestnetsVisible() {
  return useAtomValue(widgetSettingsAtom).testnetsVisible ?? false
}

export function useEvmProvider() {
  return useAtomValue(widgetSettingsAtom).ethProvider
}

export function useEvmAccountAddress() {
  const [account, setAccount] = useState<string | undefined>()
  const provider = useEvmProvider()

  useEffect(() => {
    if (provider) {
      provider.getSigner().getAddress().then(setAccount)
    } else {
      setAccount(undefined)
    }
  }, [provider, setAccount])

  return account
}

export function useEvmChainId() {
  const [chainId, setChainId] = useState<number | undefined>()
  const provider = useEvmProvider()

  useEffect(() => {
    if (provider) {
      provider
        .getNetwork()
        .then((network) => network.chainId)
        .then(setChainId)
    } else {
      setChainId(undefined)
    }
  }, [provider, setChainId])

  return chainId
}
