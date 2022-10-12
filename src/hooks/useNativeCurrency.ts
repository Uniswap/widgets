import { NativeCurrency } from '@uniswap/sdk-core'
import { useSigner } from 'components/SignerProvider'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { useMemo } from 'react'

export default function useNativeCurrency(): NativeCurrency {
  const { chainId } = useSigner()
  return useMemo(
    () =>
      chainId
        ? nativeOnChain(chainId)
        : // display mainnet when not connected
          nativeOnChain(SupportedChainId.MAINNET),
    [chainId]
  )
}
