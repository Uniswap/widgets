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

export default function useSyncTokenDefaults({
  defaultInputTokenAddress,
  defaultInputAmount,
  defaultOutputTokenAddress,
  defaultOutputAmount,
}: TokenDefaults) {
  const updateSwap = useUpdateAtom(swapAtom)
  const { chainId } = useActiveWeb3React()
  const onSupportedNetwork = useOnSupportedNetwork()
  const nativeCurrency = useNativeCurrency()
  const defaultOutputToken = useDefaultToken(defaultOutputTokenAddress, chainId)
  const defaultInputToken =
    useDefaultToken(defaultInputTokenAddress, chainId) ??
    // Default the input token to the native currency if it is not the output token.
    (defaultOutputToken !== nativeCurrency && onSupportedNetwork ? nativeCurrency : undefined)

  const setToDefaults = useCallback(() => {
    const defaultSwapState: Swap = {
      amount: '',
      [Field.INPUT]: defaultInputToken,
      [Field.OUTPUT]: defaultOutputToken,
      independentField: Field.INPUT,
    }
    if (defaultInputToken && defaultInputAmount) {
      defaultSwapState.amount = defaultInputAmount.toString()
    } else if (defaultOutputToken && defaultOutputAmount) {
      defaultSwapState.independentField = Field.OUTPUT
      defaultSwapState.amount = defaultOutputAmount.toString()
    }
    updateSwap((swap) => ({ ...swap, ...defaultSwapState }))
  }, [defaultInputAmount, defaultInputToken, defaultOutputAmount, defaultOutputToken, updateSwap])

  const isTokenListLoaded = useIsTokenListLoaded()
  const lastChainId = useRef<number | undefined>(undefined)
  const lastDefaultInputAmount = useRef<number | string | undefined>(undefined)
  const lastDefaultInputToken = useRef<Currency | undefined>(undefined)
  const lastDefaultOutputAmount = useRef<number | string | undefined>(undefined)
  const lastDefaultOutputToken = useRef<Currency | undefined>(undefined)
  useEffect(() => {
    const isNewChain = chainId && chainId !== lastChainId.current
    const isNewDefaultTokens =
      (defaultInputAmount && defaultInputAmount !== lastDefaultInputAmount.current) ||
      (defaultInputToken && defaultInputToken !== lastDefaultInputToken.current) ||
      (defaultOutputAmount && defaultOutputAmount !== lastDefaultOutputAmount.current) ||
      (defaultOutputToken && defaultOutputToken !== lastDefaultOutputToken.current)

    if (isTokenListLoaded && (isNewChain || isNewDefaultTokens)) {
      setToDefaults()
      lastChainId.current = chainId
      lastDefaultInputAmount.current = defaultInputAmount
      lastDefaultInputToken.current = defaultInputToken
      lastDefaultOutputAmount.current = defaultOutputAmount
      lastDefaultOutputToken.current = defaultOutputToken
    }
  }, [
    isTokenListLoaded,
    chainId,
    setToDefaults,
    defaultInputAmount,
    defaultInputToken,
    defaultOutputAmount,
    defaultOutputToken,
  ])
}
