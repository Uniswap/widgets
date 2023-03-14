import { Web3Provider } from '@ethersproject/providers'
import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { AccountInterface } from 'starknet'

export type { OnError } from 'components/Error/ErrorBoundary'
export type { AddEthereumChainParameter, OnSwitchChain } from 'hooks/useSwitchChain'
export type { OnConnectWalletClick } from 'state/wallet'

export const widgetSettingsAtom = atom<WidgetSettings>({})

export interface WidgetSettings {
  ethProvider?: Web3Provider
  snAccount?: AccountInterface
  testnetsVisible?: boolean
  srcChainIds?: number[]
  dstChainIds?: number[]
  toToken?: { chainId: number; address: string }
  fromToken?: { chainId: number; address: string }
  toProtocols?: string[]
  partner?: string
}

export default function useSyncWidgetSettings({
  testnetsVisible,
  ethProvider,
  snAccount,
  srcChainIds,
  dstChainIds,
  toToken,
  fromToken,
  toProtocols,
  partner,
}: WidgetSettings): void {
  const updateWidgetSettingsAtom = useUpdateAtom(widgetSettingsAtom)
  useEffect(() => {
    updateWidgetSettingsAtom({
      testnetsVisible,
      ethProvider,
      snAccount,
      srcChainIds,
      dstChainIds,
      toToken,
      fromToken,
      toProtocols,
      partner,
    })
  }, [
    updateWidgetSettingsAtom,
    testnetsVisible,
    ethProvider,
    snAccount,
    srcChainIds,
    dstChainIds,
    toToken,
    fromToken,
    toProtocols,
    partner,
  ])
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

const WIDO_SN_MAPPING: Record<string, number> = {
  //MAINNET
  '0x534e5f4d41494e': 15366,
  //TESTNET
  '0x534e5f474f45524c49': 15367,
  //TESTNET2
  '0x534e5f474f45524c4932': 15367,
}

export function useSnChainId() {
  const [chainId, setChainId] = useState<string | undefined>()
  const accountInterface = useSnAccountInterface()

  useEffect(() => {
    if (accountInterface) {
      setChainId(accountInterface?.chainId)
    } else {
      setChainId(undefined)
    }
  }, [accountInterface, setChainId])

  return chainId ? WIDO_SN_MAPPING[chainId] : undefined
}

export function useSnAccountInterface() {
  return useAtomValue(widgetSettingsAtom).snAccount
}

export function useSnAccountAddress() {
  const accountInterface = useSnAccountInterface()
  return accountInterface?.address
}

export function useSrcChainIds() {
  return useAtomValue(widgetSettingsAtom).srcChainIds
}

export function useDstChainIds() {
  return useAtomValue(widgetSettingsAtom).dstChainIds
}

export function useWidgetFromToken() {
  return useAtomValue(widgetSettingsAtom).fromToken
}

export function useWidgetToToken() {
  return useAtomValue(widgetSettingsAtom).toToken
}

export function useWidgetToProtocols() {
  return useAtomValue(widgetSettingsAtom).toProtocols
}

export function usePartnerAddress() {
  return useAtomValue(widgetSettingsAtom).partner
}
