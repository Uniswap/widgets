import { ChainId } from '@uniswap/sdk-core'
import { constructSameAddressMap } from 'utils/constructSameAddressMap'

type AddressMap = { [chainId: number]: string }

export const UNI_ADDRESS: AddressMap = constructSameAddressMap('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984')

export const MULTICALL_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0x1F98415757620B543A52E61c46B32eB19261F984', [
    ChainId.OPTIMISM_GOERLI,
    ChainId.OPTIMISM,
    ChainId.POLYGON_MUMBAI,
    ChainId.POLYGON,
  ]),
  [ChainId.ARBITRUM_ONE]: '0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB',
  [ChainId.CELO]: '0x633987602DE5C4F337e3DbF265303A1080324204',
  [ChainId.CELO_ALFAJORES]: '0x633987602DE5C4F337e3DbF265303A1080324204',
}

export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', [
    ChainId.OPTIMISM,
    ChainId.OPTIMISM_GOERLI,
    ChainId.ARBITRUM_ONE,
    ChainId.POLYGON,
    ChainId.POLYGON_MUMBAI,
  ]),
  [ChainId.CELO]: '0x5615CDAb10dc425a742d643d949a7F474C01abc4',
  [ChainId.CELO_ALFAJORES]: '0x5615CDAb10dc425a742d643d949a7F474C01abc4',
}

export const ARGENT_WALLET_DETECTOR_ADDRESS: AddressMap = {
  [ChainId.MAINNET]: '0xeca4B0bDBf7c55E9b7925919d03CbF8Dc82537E8',
}

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [ChainId.GOERLI]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
}
