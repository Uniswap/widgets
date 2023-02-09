import { Currency, TradeType } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { useToken } from 'hooks/useCurrency'
import { useEvmChainId } from 'hooks/useSyncWidgetSettings'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Field, Swap, swapAtom } from 'state/swap'

import useOnSupportedNetwork from '../useOnSupportedNetwork'
import { useIsTokenListLoaded } from '../useTokenList'

export type DefaultAddress = string | { [chainId: number]: string | 'NATIVE' } | 'NATIVE'

export interface TokenDefaults {
  defaultInputTokenAddress?: DefaultAddress
  defaultInputAmount?: number | string
  defaultOutputTokenAddress?: DefaultAddress
  defaultOutputAmount?: number | string
  defaultChainId?: SupportedChainId
}

function useDefaultToken(
  defaultAddress: DefaultAddress | undefined,
  chainId: number | undefined,
  defaultToNative: boolean
): Currency | undefined {
  let address: undefined | string = undefined
  if (typeof defaultAddress === 'string') {
    address = defaultAddress
  } else if (typeof defaultAddress === 'object' && chainId) {
    address = defaultAddress[chainId]
  }
  const token = useToken(address, chainId)
  const onSupportedNetwork = useOnSupportedNetwork(chainId)

  return useMemo(() => {
    // Only use native currency if chain ID is in supported chains. ExtendedEther will error otherwise.
    if (chainId && onSupportedNetwork && (address === 'NATIVE' || (!token && defaultToNative))) {
      return nativeOnChain(chainId)
    }

    return token ?? undefined
  }, [address, chainId, defaultToNative, onSupportedNetwork, token])
}

export default function useSyncTokenDefaults({
  defaultInputTokenAddress,
  defaultInputAmount,
  defaultOutputTokenAddress,
  defaultOutputAmount,
  defaultChainId,
}: TokenDefaults) {
  const lastChainId = useRef<number | undefined>(undefined)
  const updateSwap = useUpdateAtom(swapAtom)
  const chainId = useEvmChainId()

  const defaultOutputToken = useDefaultToken(defaultOutputTokenAddress, chainId, false)
  const defaultChainIdOutputToken = useDefaultToken(defaultOutputTokenAddress, defaultChainId, false)

  const defaultInputToken = useDefaultToken(defaultInputTokenAddress, chainId, false)
  const defaultChainIdInputToken = useDefaultToken(defaultInputTokenAddress, defaultChainId, false)

  const setToDefaults = useCallback(
    (shouldUseDefaultChainId: boolean) => {
      const defaultSwapState: Swap = {
        amount: '',
        [Field.INPUT]: shouldUseDefaultChainId ? defaultChainIdInputToken : defaultInputToken,
        [Field.OUTPUT]: shouldUseDefaultChainId ? defaultChainIdOutputToken : defaultOutputToken,
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
      defaultChainIdOutputToken,
      defaultOutputToken,
      defaultInputAmount,
      defaultOutputAmount,
      updateSwap,
    ]
  )

  const isTokenListLoaded = useIsTokenListLoaded()

  useEffect(() => {
    const isChainSwitched = chainId && chainId !== lastChainId.current
    const shouldSync = isTokenListLoaded && isChainSwitched

    if (shouldSync) {
      setToDefaults(false)
      lastChainId.current = chainId
    }
  }, [isTokenListLoaded, chainId, setToDefaults, defaultChainId])
}
