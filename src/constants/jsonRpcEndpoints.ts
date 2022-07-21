import { SupportedChainId } from './chains'

/**
 * Fallback JSON RPC endpoints if integrator does not provide one
 */
export const JSON_RPC_FALLBACK_ENDPOINTS: { [chainId: number]: string[] } = {
  [SupportedChainId.MAINNET]: ['https://cloudflare-eth.com'],
  [SupportedChainId.ROPSTEN]: ['https://rpc.ankr.com/eth_ropsten'],
  [SupportedChainId.RINKEBY]: ['https://rpc.ankr.com/eth_rinkeby'],
  [SupportedChainId.GOERLI]: ['https://rpc.ankr.com/eth_goerli'],
  [SupportedChainId.KOVAN]: ['https://kovan.poa.network'], // as of 7/21/22, this kovan endpoint is down :(
  [SupportedChainId.POLYGON]: ['https://polygon-rpc.com', 'https://rpc-mainnet.matic.quiknode.pro'],
  [SupportedChainId.POLYGON_MUMBAI]: ['https://rpc-mumbai.maticvigil.com'],
  [SupportedChainId.ARBITRUM_ONE]: ['https://arbitrum.public-rpc.com'],
  [SupportedChainId.ARBITRUM_RINKEBY]: ['https://rinkeby.arbitrum.io/rpc'],
  [SupportedChainId.OPTIMISM]: ['https://rpc.ankr.com/optimism'],
  [SupportedChainId.OPTIMISTIC_KOVAN]: ['https://kovan.optimism.io'],
  // [SupportedChainId.CELO]: ['https://rpc.ankr.com/celo'], // TODO: need to add support for Celo
}
