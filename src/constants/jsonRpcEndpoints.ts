import { SupportedChainId } from './chains'

/**
 * Fallback JSON RPC endpoints if integrator does not provide one
 */
export const JSON_RPC_FALLBACK_ENDPOINTS: { [key in SupportedChainId]?: string[] } = {
  // KOVAN = 42,
  // ARBITRUM_RINKEBY = 421611,
  // OPTIMISTIC_KOVAN = 69,
  // POLYGON = 137,
  [SupportedChainId.MAINNET]: ['https://cloudflare-eth.com'],
  [SupportedChainId.ROPSTEN]: ['https://rpc.ankr.com/eth_ropsten'],
  [SupportedChainId.RINKEBY]: ['https://rpc.ankr.com/eth_rinkeby'],
  [SupportedChainId.GOERLI]: ['https://rpc.ankr.com/eth_goerli'],
  [SupportedChainId.ARBITRUM_ONE]: ['https://arbitrum.public-rpc.com'],
  [SupportedChainId.OPTIMISM]: ['https://rpc.ankr.com/optimism'],
  [SupportedChainId.POLYGON]: [
    'https://polygon-rpc.com',
    'https://rpc-mainnet.matic.network',
    'https://rpc-mainnet.matic.quiknode.pro',
  ],
  // [SupportedChainId.CELO]: ['https://rpc.ankr.com/celo'],
}
