import { NativeCurrency, Token } from '@uniswap/sdk-core'
import { useEvmChainId } from 'hooks/useSyncWidgetSettings'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { useMemo } from 'react'

export default function useNativeCurrency(): NativeCurrency | Token {
  const chainId = useEvmChainId()
  return useMemo(
    () =>
      chainId
        ? nativeOnChain(chainId)
        : // display mainnet when not connected
          nativeOnChain(SupportedChainId.MAINNET),
    [chainId]
  )
}

export function useNativeCurrencies(): (NativeCurrency | Token)[] {
  return useMemo(() => [nativeOnChain(SupportedChainId.MAINNET), nativeOnChain(SupportedChainId.POLYGON)], [])
}
