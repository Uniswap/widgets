import { Currency, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'
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

function useDefaultInputToken(
  defaultAddress: DefaultAddress | undefined,
  chainId: number | undefined,
  defaultOutputToken: Currency | undefined
): Currency | undefined {
  const nativeCurrency = useNativeCurrency()
  const onSupportedNetwork = useOnSupportedNetwork()

  return (
    useDefaultToken(defaultAddress, chainId) ??
    // Default the input token to the native currency if it is not the output token.
    (defaultOutputToken !== nativeCurrency && onSupportedNetwork ? nativeCurrency : undefined)
  )
}

export default function useSyncTokenDefaults(
  { defaultInputTokenAddress, defaultInputAmount, defaultOutputTokenAddress, defaultOutputAmount }: TokenDefaults,
  defaultChainId?: SupportedChainId
) {
  const lastChainId = useRef<number | undefined>(undefined)
  const lastConnector = useRef<Connector | undefined>(undefined)
  const updateSwap = useUpdateAtom(swapAtom)
  const { chainId, connector } = useWeb3React()

  const defaultOutputToken = useDefaultToken(defaultOutputTokenAddress, chainId)
  const defaultInputToken = useDefaultInputToken(defaultInputTokenAddress, chainId, defaultOutputToken)
  const defaultChainIdInputToken = useDefaultInputToken(defaultInputTokenAddress, defaultChainId, defaultOutputToken)

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

  useEffect(() => {
    const isSwitchChain = chainId && chainId !== lastChainId.current
    const isSwitchConnector = connector && connector !== lastConnector.current
    const shouldSync = isTokenListLoaded && (isSwitchChain || isSwitchConnector)
    const shouldSetToDefaultChainId = isSwitchConnector && defaultChainId

    if (shouldSync) {
      setToDefaults(shouldSetToDefaultChainId)

      lastChainId.current = chainId
      lastConnector.current = connector
    }
  }, [isTokenListLoaded, chainId, setToDefaults, connector, defaultChainId])
}
