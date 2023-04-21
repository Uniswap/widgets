import { Web3Provider } from '@ethersproject/providers'
import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { AccountInterface } from 'starknet'
import { isStarknetChain } from 'utils/starknet'
import { quote, QuoteRequest, QuoteResult } from 'wido'

export const widgetSettingsAtom = atom<WidgetSettings>({})
/**
 * Stores whether the user selected a `from` token on the UI
 */
export const userSelectedFromToken = atom<boolean>(false)
/**
 * Stores whether the user selected a `to` token on the UI
 */
export const userSelectedToToken = atom<boolean>(false)

export interface WidgetSettings {
  ethProvider?: Web3Provider
  snAccount?: AccountInterface
  toTokens?: { chainId: number; address: string }[]
  fromTokens?: { chainId: number; address: string }[]
  presetToToken?: { chainId: number; address: string }
  presetFromToken?: { chainId: number; address: string }
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
  presetToToken,
  presetFromToken,
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
      presetToToken,
      presetFromToken,
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
    presetToToken,
    presetFromToken,
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

/**
 * Checks if a preset token should be used in the `From` field
 * If it is the case, it returns the token, otherwise undefined, meaning no preset.
 */
export function useWidgetFromToken() {
  const { fromTokens, presetFromToken } = useAtomValue(widgetSettingsAtom)
  const userHasSelected = useAtomValue(userSelectedFromToken)
  // if the user selected something, no preset token
  if (userHasSelected) {
    return undefined
  }
  // if only one token on the list, that should be the preset
  if (fromTokens && Array.isArray(fromTokens) && fromTokens.length === 1) {
    return fromTokens[0]
  }
  // if a preset is given by props, that should be the preset
  if (presetFromToken && presetFromToken.chainId && presetFromToken.address) {
    return presetFromToken
  }
  // otherwise none
  return undefined
}

/**
 * Checks if a preset token should be used in the `To` field
 * If it is the case, it returns the token, otherwise undefined, meaning no preset.
 */
export function useWidgetToToken() {
  const { toTokens, presetToToken } = useAtomValue(widgetSettingsAtom)
  const userHasSelected = useAtomValue(userSelectedToToken)
  // if the user selected something, no preset token
  if (userHasSelected) {
    return undefined
  }
  // if only one token on the list, that should be the preset
  if (toTokens && Array.isArray(toTokens) && toTokens.length === 1) {
    return toTokens[0]
  }
  // if a preset is given by props, that should be the preset
  if (presetToToken && presetToToken.chainId && presetToToken.address) {
    return presetToToken
  }
  // otherwise none
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
