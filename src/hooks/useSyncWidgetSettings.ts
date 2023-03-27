import { Web3Provider } from '@ethersproject/providers'
import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { AccountInterface } from 'starknet'
import { isStarknetChain } from 'utils/starknet'
import { quote, QuoteRequest, QuoteResult } from 'wido'

export const widgetSettingsAtom = atom<WidgetSettings>({})

export interface WidgetSettings {
  ethProvider?: Web3Provider
  snAccount?: AccountInterface
  toTokens?: { chainId: number; address: string }[]
  fromTokens?: { chainId: number; address: string }[]
  partner?: string
  quoteApi?: (request: QuoteRequest) => Promise<QuoteResult>
  /**
   * @default "Zap"
   */
  title?: string
  /**
   * Whether the widget can open the token select in a larger Modal, or to show it contained within the widget.
   *
   * @default false
   */
  largeTokenSelect?: boolean
}

export default function useSyncWidgetSettings({
  ethProvider,
  snAccount,
  toTokens,
  fromTokens,
  partner,
  quoteApi,
  title,
  largeTokenSelect,
}: WidgetSettings): void {
  const updateWidgetSettingsAtom = useUpdateAtom(widgetSettingsAtom)
  useEffect(() => {
    updateWidgetSettingsAtom({
      ethProvider,
      snAccount,
      toTokens,
      fromTokens,
      partner,
      quoteApi,
      title,
      largeTokenSelect,
    })
  }, [
    updateWidgetSettingsAtom,
    ethProvider,
    snAccount,
    toTokens,
    fromTokens,
    partner,
    quoteApi,
    title,
    largeTokenSelect,
  ])
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

export function useRecipientAddress(chainId: number) {
  const snAccountAddress = useSnAccountAddress()
  const evmAccountAddress = useEvmAccountAddress()

  if (isStarknetChain(chainId)) {
    return snAccountAddress || ''
  } else {
    return evmAccountAddress || ''
  }
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

export function useWidgetTitle() {
  return useAtomValue(widgetSettingsAtom).title || 'Zap'
}

export function useLargeTokenSelect() {
  return useAtomValue(widgetSettingsAtom).largeTokenSelect || false
}
