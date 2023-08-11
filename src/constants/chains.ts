import { ChainId } from '@uniswap/sdk-core'

export enum ChainName {
  MAINNET = 'mainnet',
  ROPSTEN = 'ropsten',
  RINKEBY = 'rinkeby',
  GOERLI = 'goerli',
  KOVAN = 'kovan',
  OPTIMISM = 'optimism-mainnet',
  OPTIMISM_GOERLI = 'optimism-goerli',
  ARBITRUM_ONE = 'arbitrum-mainnet',
  ARBITRUM_RINKEBY = 'arbitrum-rinkeby',
  POLYGON = 'polygon-mainnet',
  POLYGON_MUMBAI = 'polygon-mumbai',
  CELO = 'celo',
  CELO_ALFAJORES = 'celo-alfajores',
  BNB = 'bnb',
  AVALANCHE = 'avalanche',
  BASE = 'base',
}

export const CHAIN_NAMES_TO_IDS: { [chainName: string]: ChainId } = {
  [ChainName.MAINNET]: ChainId.MAINNET,
  [ChainName.GOERLI]: ChainId.GOERLI,
  [ChainName.POLYGON]: ChainId.POLYGON,
  [ChainName.POLYGON_MUMBAI]: ChainId.POLYGON_MUMBAI,
  [ChainName.ARBITRUM_ONE]: ChainId.ARBITRUM_ONE,
  [ChainName.OPTIMISM]: ChainId.OPTIMISM,
  [ChainName.OPTIMISM_GOERLI]: ChainId.OPTIMISM_GOERLI,
  [ChainName.CELO]: ChainId.CELO,
  [ChainName.CELO_ALFAJORES]: ChainId.CELO_ALFAJORES,
  [ChainName.BNB]: ChainId.BNB,
  [ChainName.AVALANCHE]: ChainId.AVALANCHE,
  [ChainName.BASE]: ChainId.BASE,
}

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: ChainId[] = Object.values(ChainId).filter(
  (id) => typeof id === 'number'
) as ChainId[]

export const SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.POLYGON,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM_ONE,
  ChainId.CELO,
  ChainId.BNB,
]

/**
 * All the chain IDs that are running the Ethereum protocol.
 */
export const L1_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.GOERLI,
  ChainId.POLYGON,
  ChainId.POLYGON_MUMBAI,
  ChainId.CELO,
  ChainId.CELO_ALFAJORES,
] as const

export type SupportedL1ChainId = typeof L1_CHAIN_IDS[number]

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS = [ChainId.ARBITRUM_ONE, ChainId.OPTIMISM, ChainId.OPTIMISM_GOERLI] as const

export type SupportedL2ChainId = typeof L2_CHAIN_IDS[number]

export function isPolygonChain(chainId: number): chainId is ChainId.POLYGON | ChainId.POLYGON_MUMBAI {
  return chainId === ChainId.POLYGON || chainId === ChainId.POLYGON_MUMBAI
}
