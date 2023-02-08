import { Currency } from '@uniswap/sdk-core'
import EthereumLogo from 'assets/images/ethereum-logo.png'
import CeloLogo from 'assets/svg/celo_logo.svg'
import MaticLogo from 'assets/svg/matic-token-icon.svg'
import { useTokenLogoTableEntry } from 'components/Logo/hooks'
import { SupportedChainId } from 'constants/chains'
import { useMemo } from 'react'

function getNativeLogoURI(chainId: SupportedChainId = SupportedChainId.MAINNET): string {
  switch (chainId) {
    case SupportedChainId.POLYGON_MUMBAI:
    case SupportedChainId.POLYGON:
      return MaticLogo
    case SupportedChainId.CELO:
    case SupportedChainId.CELO_ALFAJORES:
      return CeloLogo
    default:
      return EthereumLogo
  }
}

export default function useCurrencyLogoURIs(currency?: (Currency & { logoURI?: string }) | null): string[] {
  const entry = useTokenLogoTableEntry(currency?.wrapped.address, currency?.wrapped.chainId ?? SupportedChainId.MAINNET)
  return useMemo(
    () => (currency?.isNative ? [getNativeLogoURI(currency.chainId)] : entry?.getAllUris() ?? []),
    [currency?.chainId, currency?.isNative, entry]
  )
}
