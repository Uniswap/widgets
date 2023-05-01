import { Currency } from '@uniswap/sdk-core'
import EthereumLogo from 'assets/images/ethereum-logo.png'
import arbitrumLogoUrl from 'assets/svg/arbitrum_logo.svg'
import AuroraLogo from 'assets/svg/aurora-logo.svg'
import avalancheLogo from 'assets/svg/avalanche-logo.svg'
import BscLogo from 'assets/svg/bsc-logo.svg'
import CeloLogo from 'assets/svg/celo_logo.svg'
import fantomLogo from 'assets/svg/fantom-logo.svg'
import MaticLogo from 'assets/svg/matic-token-icon.svg'
import optimismLogoUrl from 'assets/svg/optimism_logo.svg'
import starknetLogo from 'assets/svg/starknet-logo.svg'
import { ChainName, SupportedChainId } from 'constants/chains'
import useHttpLocations from 'hooks/useHttpLocations'
import { useMemo } from 'react'

import { isCelo, nativeOnChain } from '../constants/tokens'

type Network = 'ethereum' | 'arbitrum' | 'optimism' | 'aurora' | 'bsc' | 'avalanche'

function chainIdToNetworkName(networkId: SupportedChainId): Network {
  switch (networkId) {
    case SupportedChainId.MAINNET:
      return 'ethereum'
    case SupportedChainId.ARBITRUM_ONE:
      return 'arbitrum'
    case SupportedChainId.OPTIMISM:
      return 'optimism'
    case SupportedChainId.AURORA:
      return 'aurora'
    case SupportedChainId.BSC:
      return ChainName.BSC
    case SupportedChainId.AVALANCHE:
      return ChainName.AVALANCHE
    default:
      return 'ethereum'
  }
}

export function getNativeLogoURI(chainId: SupportedChainId = SupportedChainId.MAINNET): string {
  switch (chainId) {
    case SupportedChainId.POLYGON_MUMBAI:
    case SupportedChainId.POLYGON:
      return MaticLogo
    case SupportedChainId.CELO:
    case SupportedChainId.CELO_ALFAJORES:
      return CeloLogo
    case SupportedChainId.STARKNET:
    case SupportedChainId.STARKNET_GOERLI:
      return starknetLogo
    case SupportedChainId.ARBITRUM_ONE:
      return arbitrumLogoUrl
    case SupportedChainId.OPTIMISM:
      return optimismLogoUrl
    case SupportedChainId.FANTOM:
      return fantomLogo
    case SupportedChainId.AURORA:
    case SupportedChainId.AURORA_TESTNET:
      return AuroraLogo
    case SupportedChainId.BSC:
      return BscLogo
    case SupportedChainId.AVALANCHE:
      return avalancheLogo
    default:
      return EthereumLogo
  }
}

function getTokenLogoURI(address: string, chainId: SupportedChainId = SupportedChainId.MAINNET): string | void {
  const networkName = chainIdToNetworkName(chainId)
  const networksWithUrls = [SupportedChainId.ARBITRUM_ONE, SupportedChainId.MAINNET, SupportedChainId.OPTIMISM]
  if (networksWithUrls.includes(chainId)) {
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${address}/logo.png`
  }

  if (isCelo(chainId)) {
    if (address === nativeOnChain(chainId).wrapped.address) {
      // The alternative logo represents $CELO as an erc-20 token and is consistent with token lists used by the
      // interface and other applications on Celo. The same logo should be displayed on the swap widget as on the
      // token list. Whereas the green and yellow logo traditionally represents the network itself.
      return 'https://celo-org.github.io/celo-token-list/assets/celo_alternative_logo.png'
    }
  }
}

export default function useCurrencyLogoURIs(currency?: (Currency & { logoURI?: string }) | null): string[] {
  const locations = useHttpLocations(currency?.logoURI)
  return useMemo(() => {
    const logoURIs = [...locations]
    if (currency) {
      if (currency.isNative) {
        logoURIs.push(getNativeLogoURI(currency.chainId))
      } else if (currency.isToken) {
        const logoURI = getTokenLogoURI(currency.address, currency.chainId)
        if (logoURI) {
          logoURIs.push(logoURI)
        }
      }
    }
    return logoURIs
  }, [currency, locations])
}
