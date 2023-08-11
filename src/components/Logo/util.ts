import { ChainId } from '@uniswap/sdk-core'
import { isAddress } from 'utils'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import BnbLogo from '../../assets/svg/bnb-logo.svg'
import CeloLogo from '../../assets/svg/celo_logo.svg'
import MaticLogo from '../../assets/svg/matic-token-icon.svg'
import { LogoTableInput } from './LogoTable'

type Network = 'ethereum' | 'arbitrum' | 'optimism' | 'polygon' | 'celo' | 'smartchain'

function chainIdToNetworkName(networkId: ChainId): Network | undefined {
  switch (networkId) {
    case ChainId.MAINNET:
      return 'ethereum'
    case ChainId.ARBITRUM_ONE:
      return 'arbitrum'
    case ChainId.OPTIMISM:
      return 'optimism'
    case ChainId.POLYGON:
      return 'polygon'
    case ChainId.CELO:
      return 'celo'
    case ChainId.BNB:
      return 'smartchain'
    default:
      return 'ethereum'
  }
}

export function getAssetsRepoURI(asset: LogoTableInput): string | undefined {
  const networkName = chainIdToNetworkName(asset.chainId)
  if (!networkName) return

  if (asset.isNative)
    return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/info/logo.png`

  const checksummedAddress = isAddress(asset.address)
  return checksummedAddress
    ? `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${checksummedAddress}/logo.png`
    : undefined
}

export function getNativeLogoURI(chainId: ChainId = ChainId.MAINNET): string {
  switch (chainId) {
    case ChainId.POLYGON:
    case ChainId.POLYGON_MUMBAI:
      return MaticLogo
    case ChainId.CELO:
    case ChainId.CELO_ALFAJORES:
      return CeloLogo
    case ChainId.BNB:
      return BnbLogo
    default:
      return EthereumLogo
  }
}
