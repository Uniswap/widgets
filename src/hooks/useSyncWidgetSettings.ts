import { Web3Provider } from '@ethersproject/providers'
import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { AccountInterface } from 'starknet'
import { quote, QuoteRequest, QuoteResult } from 'wido'

export const widgetSettingsAtom = atom<WidgetSettings>({})

export interface WidgetSettings {
  ethProvider?: Web3Provider
  snAccount?: AccountInterface
  testnetsVisible?: boolean
  toTokens?: { chainId: number; address: string }[]
  fromTokens?: { chainId: number; address: string }[]
  partner?: string
  quoteApi?: (request: QuoteRequest) => Promise<QuoteResult>
}

export default function useSyncWidgetSettings({
  testnetsVisible,
  ethProvider,
  snAccount,
  toTokens,
  fromTokens,
  partner,
  quoteApi,
}: WidgetSettings): void {
  const updateWidgetSettingsAtom = useUpdateAtom(widgetSettingsAtom)
  useEffect(() => {
    updateWidgetSettingsAtom({
      testnetsVisible,
      ethProvider,
      snAccount,
      toTokens,
      fromTokens,
      partner,
      quoteApi,
    })
  }, [updateWidgetSettingsAtom, testnetsVisible, ethProvider, snAccount, toTokens, fromTokens, partner, quoteApi])
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
  '0x534e5f474f45524c4932': 15368,
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
  const { fromTokens } = useAtomValue(widgetSettingsAtom)
  const set = fromTokens?.reduce((acc, token) => acc.add(token.chainId), new Set<number>())
  return set ? Array.from(set) : undefined
}

export function useDstChainIds() {
  const { toTokens } = useAtomValue(widgetSettingsAtom)
  const set = toTokens?.reduce((acc, token) => acc.add(token.chainId), new Set<number>())
  return set ? Array.from(set) : undefined
}

export function useWidgetFromToken() {
  const { fromTokens } = useAtomValue(widgetSettingsAtom)
  if (fromTokens && Array.isArray(fromTokens) && fromTokens.length === 1) {
    return fromTokens[0]
  }
  return undefined
}

export function useWidgetToToken() {
  const { toTokens } = useAtomValue(widgetSettingsAtom)
  if (toTokens && Array.isArray(toTokens) && toTokens.length === 1) {
    return toTokens[0]
  }
  return undefined
}

export function usePartnerAddress() {
  return useAtomValue(widgetSettingsAtom).partner
}

export function useQuoteApi() {
  return useAtomValue(widgetSettingsAtom).quoteApi || quote
}
