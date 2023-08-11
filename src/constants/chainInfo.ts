import { ChainId } from '@uniswap/sdk-core'
import ethereumLogoUrl from 'assets/images/ethereum-logo.png'
import arbitrumLogoUrl from 'assets/svg/arbitrum_logo.svg'
import avaxLogo from 'assets/svg/avax-logo.svg'
import baseLogo from 'assets/svg/base-logo.svg'
import bnbLogo from 'assets/svg/bnb-logo.svg'
import celoLogo from 'assets/svg/celo_logo.svg'
import optimismLogoUrl from 'assets/svg/optimism_logo.svg'
import polygonMaticLogo from 'assets/svg/polygon-matic-logo.svg'
import ms from 'ms.macro'

import { SupportedL1ChainId, SupportedL2ChainId } from './chains'

export const STANDARD_L1_BLOCK_TIME = ms`12s`

export enum NetworkType {
  L1,
  L2,
}

interface BaseChainInfo {
  readonly networkType: NetworkType
  readonly blockWaitMsBeforeWarning?: number
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logoUrl: string
  /*
   * The label and native currency symbol as listed on the "safe" list used by MetaMask: https://chainid.network/chains.json.
   * If undefined, label and nativeCurrency.symbol may be safely used.
   * MetaMask shows a warning when adding a chain using anything but its "safe" label.
   */
  readonly safe?: {
    label?: string
    symbol?: string
  }
  readonly label: string
  readonly helpCenterUrl?: string
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH'
    symbol: string // e.g. 'gorETH'
    decimals: 18 // e.g. 18
  }
  readonly color?: string
  readonly backgroundColor?: string
}

export interface L1ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L1
}

export interface L2ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L2
  readonly bridge: string
  readonly statusPage?: string
}

export type ChainInfoMap = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } & {
  readonly [chainId in SupportedL2ChainId]: L2ChainInfo
} &
  { readonly [chainId in SupportedL1ChainId]: L1ChainInfo }

const CHAIN_INFO: ChainInfoMap = {
  [ChainId.MAINNET]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Ethereum',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    color: '#627EEA',
  },
  [ChainId.GOERLI]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://goerli.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Görli',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Görli Ether', symbol: 'görETH', decimals: 18 },
    color: '#209853',
  },
  [ChainId.OPTIMISM]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`25m`,
    bridge: 'https://app.optimism.io/bridge',
    docs: 'https://optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/optimism/',
    label: 'Optimism',
    logoUrl: optimismLogoUrl,
    statusPage: 'https://optimism.io/status',
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137778-uniswap-on-optimistic-ethereum-oξ',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    color: '#FF0420',
    backgroundColor: '#ff042029',
  },
  [ChainId.OPTIMISM_GOERLI]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`25m`,
    bridge: 'https://app.optimism.io/bridge',
    docs: 'https://optimism.io/',
    explorer: 'https://goerli-optimism.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/optimism/',
    safe: { label: 'Optimism Goerli Testnet', symbol: 'ETH' },
    label: 'Optimism Görli',
    logoUrl: optimismLogoUrl,
    statusPage: 'https://optimism.io/status',
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137778-uniswap-on-optimistic-ethereum-oξ',
    nativeCurrency: { name: 'Optimism Goerli Ether', symbol: 'görOpETH', decimals: 18 },
    color: '#FF0420',
    backgroundColor: '#ff042029',
  },
  [ChainId.ARBITRUM_ONE]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://bridge.arbitrum.io/',
    docs: 'https://offchainlabs.com/',
    explorer: 'https://arbiscan.io/',
    infoLink: 'https://info.uniswap.org/#/arbitrum',
    label: 'Arbitrum',
    logoUrl: arbitrumLogoUrl,
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137787-uniswap-on-arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    color: '#28A0F0',
    backgroundColor: '#28a0f029',
  },
  [ChainId.POLYGON]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://wallet.polygon.technology/login?redirectTo=%2Fpolygon%2Fbridge',
    docs: 'https://polygon.io/',
    explorer: 'https://polygonscan.com/',
    infoLink: 'https://info.uniswap.org/#/polygon/',
    safe: { label: 'Polygon Mainnet' },
    label: 'Polygon',
    logoUrl: polygonMaticLogo,
    nativeCurrency: { name: 'Polygon Matic', symbol: 'MATIC', decimals: 18 },
    color: '#A457FF',
    backgroundColor: '#a457ff29',
  },
  [ChainId.POLYGON_MUMBAI]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://wallet.polygon.technology/login?redirectTo=%2Fpolygon%2Fbridge',
    docs: 'https://polygon.io/',
    explorer: 'https://mumbai.polygonscan.com/',
    infoLink: 'https://info.uniswap.org/#/polygon/',
    safe: { symbol: 'MATIC' },
    label: 'Polygon Mumbai',
    logoUrl: polygonMaticLogo,
    nativeCurrency: { name: 'Polygon Mumbai Matic', symbol: 'mMATIC', decimals: 18 },
    color: '#A457FF',
    backgroundColor: '#a457ff29',
  },
  [ChainId.CELO]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://www.portalbridge.com/#/transfer',
    docs: 'https://docs.celo.org/',
    explorer: 'https://celoscan.io/',
    infoLink: 'https://info.uniswap.org/#/celo',
    safe: { label: 'Celo Mainnet' },
    label: 'Celo',
    logoUrl: celoLogo,
    nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
    color: '#35D07F',
    backgroundColor: '#34d07f1f',
  },
  [ChainId.CELO_ALFAJORES]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://www.portalbridge.com/#/transfer',
    docs: 'https://docs.celo.org/',
    explorer: 'https://alfajores.celoscan.io/',
    infoLink: 'https://info.uniswap.org/#/celo',
    safe: { label: 'Celo Alfajores Testnet', symbol: 'CELO' },
    label: 'Celo Alfajores',
    logoUrl: celoLogo,
    nativeCurrency: { name: 'Celo', symbol: 'aCELO', decimals: 18 },
    color: '#35D07F',
    backgroundColor: '#34d07f1f',
  },
  [ChainId.BNB]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://cbridge.celer.network/1/56',
    docs: 'https://docs.bnbchain.org/',
    explorer: 'https://bscscan.com/',
    infoLink: 'https://info.uniswap.org/#/bnb/',
    label: 'BNB Chain',
    logoUrl: bnbLogo,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    color: '#F0B90B',
    backgroundColor: '#F0B90B',
  },
  [ChainId.AVALANCHE]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://core.app/bridge/',
    docs: 'https://docs.avax.network/',
    explorer: 'https://snowtrace.io/',
    infoLink: 'https://info.uniswap.org/#/avax/', // TODO(WEB-2336): Add avax support to info site
    label: 'Avalanche',
    logoUrl: avaxLogo,
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    color: '#FF0420',
    backgroundColor: '#FF04201f',
  },
  [ChainId.BASE]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`25m`,
    bridge: 'https://bridge.base.org/deposit',
    docs: 'https://docs.base.org',
    explorer: 'https://basescan.org/',
    infoLink: 'https://info.uniswap.org/#/base/',
    label: 'Base',
    logoUrl: baseLogo,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    color: '#0052FF',
    backgroundColor: '#0052FF1f',
  },
  [ChainId.BASE_GOERLI]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`25m`,
    bridge: 'https://goerli-bridge.base.org/deposit',
    docs: 'https://docs.base.org',
    explorer: 'https://goerli.basescan.org/',
    infoLink: 'https://info.uniswap.org/#/base/', // base testnet not supported
    label: 'Base Goerli',
    logoUrl: baseLogo,
    nativeCurrency: { name: 'Base Goerli Ether', symbol: 'ETH', decimals: 18 },
    color: '#0052FF',
    backgroundColor: '#0052FF1f',
  },
}

export function getChainInfo(chainId: SupportedL1ChainId): L1ChainInfo
export function getChainInfo(chainId: SupportedL2ChainId): L2ChainInfo
export function getChainInfo(chainId: ChainId): L1ChainInfo | L2ChainInfo
export function getChainInfo(
  chainId: ChainId | SupportedL1ChainId | SupportedL2ChainId | number | undefined
): L1ChainInfo | L2ChainInfo | undefined

/**
 * Overloaded method for returning ChainInfo given a chainID
 * Return type varies depending on input type:
 * number | undefined -> returns chaininfo | undefined
 * SupportedChainId -> returns L1ChainInfo | L2ChainInfo
 * SupportedL1ChainId -> returns L1ChainInfo
 * SupportedL2ChainId -> returns L2ChainInfo
 */
export function getChainInfo(chainId: any): any {
  if (chainId) {
    return CHAIN_INFO[chainId] ?? undefined
  }
  return undefined
}

export const MAINNET_INFO = CHAIN_INFO[ChainId.MAINNET]
export function getChainInfoOrDefault(chainId: number | undefined) {
  return getChainInfo(chainId) ?? MAINNET_INFO
}

export function isSupportedChainId(chainId: number | undefined): chainId is ChainId {
  if (chainId === undefined) return false
  return !!ChainId[chainId]
}
