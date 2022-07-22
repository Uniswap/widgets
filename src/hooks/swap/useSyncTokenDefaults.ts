import { Currency } from '@uniswap/sdk-core'
import { nativeOnChain } from 'constants/tokens'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
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

export default function useSyncTokenDefaults(tokenDefaults: TokenDefaults) {
  const updateSwap = useUpdateAtom(swapAtom)
  const { chainId } = useActiveWeb3React()
  const onSupportedNetwork = useOnSupportedNetwork()
  const nativeCurrency = useNativeCurrency()
  const defaultOutputToken = useDefaultToken(tokenDefaults.defaultOutputTokenAddress, chainId)
  const defaultInputToken =
    useDefaultToken(tokenDefaults.defaultInputTokenAddress, chainId) ??
    // Default the input token to the native currency if it is not the output token.
    (defaultOutputToken !== nativeCurrency && onSupportedNetwork ? nativeCurrency : undefined)

  const setToDefaults = useCallback(() => {
    const defaultSwapState: Swap = {
      amount: '',
      [Field.INPUT]: defaultInputToken,
      [Field.OUTPUT]: defaultOutputToken,
      independentField: Field.INPUT,
    }
    if (defaultInputToken && tokenDefaults.defaultInputAmount) {
      defaultSwapState.amount = tokenDefaults.defaultInputAmount.toString()
    } else if (defaultOutputToken && tokenDefaults.defaultOutputAmount) {
      defaultSwapState.independentField = Field.OUTPUT
      defaultSwapState.amount = tokenDefaults.defaultOutputAmount.toString()
    }
    updateSwap((swap) => ({ ...swap, ...defaultSwapState }))
  }, [
    tokenDefaults.defaultInputAmount,
    defaultInputToken,
    tokenDefaults.defaultOutputAmount,
    defaultOutputToken,
    updateSwap,
  ])

  const isTokenListLoaded = useIsTokenListLoaded()
  useEffect(() => {
    if (!isTokenListLoaded) return
    setToDefaults()
  }, [chainId, tokenDefaults, setToDefaults])
}
