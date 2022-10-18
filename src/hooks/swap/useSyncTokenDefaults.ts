import { Currency, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { useToken } from 'hooks/useCurrency'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect, useRef } from 'react'
import { Field, Swap, swapAtom } from 'state/swap'

import useOnSupportedNetwork from '../useOnSupportedNetwork'
import { useIsTokenListLoaded } from '../useTokenList'

export type DefaultAddress = string | { [chainId: number]: string | 'NATIVE' } | 'NATIVE'

export interface TokenDefaults {
  defaultInputTokenAddress?: DefaultAddress
  defaultInputAmount?: number | string
  defaultOutputTokenAddress?: DefaultAddress
  defaultOutputAmount?: number | string
}

function useDefaultToken(
  defaultAddress: DefaultAddress | undefined,
  chainId: number | undefined
): Currency | undefined {
  let address = undefined
  if (typeof defaultAddress === 'string') {
    address = defaultAddress
  } else if (typeof defaultAddress === 'object' && chainId) {
    address = defaultAddress[chainId]
  }
  const token = useToken(address)

  const onSupportedNetwork = useOnSupportedNetwork()

  // Only use native currency if chain ID is in supported chains. ExtendedEther will error otherwise.
  if (chainId && address === 'NATIVE' && onSupportedNetwork) {
    return nativeOnChain(chainId)
  }
  return token ?? undefined
}

export default function useSyncTokenDefaults(
  { defaultInputTokenAddress, defaultInputAmount, defaultOutputTokenAddress, defaultOutputAmount }: TokenDefaults,
  defaultChainId: SupportedChainId
) {
  const lastChainId = useRef<number | undefined>(undefined)
  const didPriorityConnect = useRef<boolean | undefined>(false)
  const updateSwap = useUpdateAtom(swapAtom)
  const { chainId, hooks } = useWeb3React()
  const onSupportedNetwork = useOnSupportedNetwork()
  const nativeCurrency = useNativeCurrency()
  const defaultOutputToken = useDefaultToken(defaultOutputTokenAddress, chainId)
  const defaultInputToken =
    useDefaultToken(defaultInputTokenAddress, chainId) ??
    // Default the input token to the native currency if it is not the output token.
    (defaultOutputToken !== nativeCurrency && onSupportedNetwork ? nativeCurrency : undefined)
  const defaultChainIdInputToken =
    useDefaultToken(defaultInputTokenAddress, defaultChainId) ??
    // Default the input token to the native currency if it is not the output token.
    (defaultOutputToken !== nativeCurrency && onSupportedNetwork ? nativeCurrency : undefined)

  const setToDefaults = useCallback(
    (shouldUseDefaultChainId = false) => {
      const defaultSwapState: Swap = {
        amount: '',
        [Field.INPUT]: shouldUseDefaultChainId ? defaultChainIdInputToken : defaultInputToken,
        [Field.OUTPUT]: defaultOutputToken,
        type: TradeType.EXACT_INPUT,
      }
      if (defaultInputToken && defaultInputAmount) {
        defaultSwapState.amount = defaultInputAmount.toString()
      } else if (defaultOutputToken && defaultOutputAmount) {
        defaultSwapState.type = TradeType.EXACT_OUTPUT
        defaultSwapState.amount = defaultOutputAmount.toString()
      }
      updateSwap((swap) => ({ ...swap, ...defaultSwapState }))
    },
    [
      defaultChainIdInputToken,
      defaultInputToken,
      defaultOutputToken,
      defaultInputAmount,
      defaultOutputAmount,
      updateSwap,
    ]
  )

  const isTokenListLoaded = useIsTokenListLoaded()
  const isPriorityConnectorActivating = hooks.usePriorityIsActivating()

  useEffect(() => {
    const isSwitchChain = chainId !== lastChainId.current
    const shouldSync = isTokenListLoaded && chainId && isSwitchChain
    const shouldUseDefaultChainId = didPriorityConnect.current === false && !isPriorityConnectorActivating

    if (shouldSync) {
      setToDefaults(shouldUseDefaultChainId)
      if (shouldUseDefaultChainId) {
        didPriorityConnect.current = true
      }

      lastChainId.current = chainId
    }
  }, [isTokenListLoaded, chainId, setToDefaults, isPriorityConnectorActivating])
}
