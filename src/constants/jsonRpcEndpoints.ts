import { SupportedChainId } from './chains'

/**
 * Fallback JSON RPC endpoints if integrator does not provide one
 */
export const JSON_RPC_FALLBACK_ENDPOINTS: { [chainId: number]: string[] } = {
  [SupportedChainId.MAINNET]: ['https://rpc.ankr.com/eth', 'https://eth-mainnet.public.blastapi.io'],
  [SupportedChainId.ROPSTEN]: ['https://rpc.ankr.com/eth_ropsten'],
  [SupportedChainId.RINKEBY]: ['https://rinkeby-light.eth.linkpool.io/'],
  [SupportedChainId.GOERLI]: ['https://rpc.ankr.com/eth_goerli'],
  [SupportedChainId.KOVAN]: ['https://eth-kovan.public.blastapi.io', 'https://kovan.poa.network'],
  [SupportedChainId.POLYGON]: ['https://rpc-mainnet.matic.quiknode.pro', 'https://polygon-rpc.com'],
  [SupportedChainId.POLYGON_MUMBAI]: ['https://matic-mumbai.chainstacklabs.com'],
  [SupportedChainId.ARBITRUM_ONE]: ['https://arbitrum.public-rpc.com'],
  [SupportedChainId.ARBITRUM_RINKEBY]: ['https://rinkeby.arbitrum.io/rpc'],
  [SupportedChainId.OPTIMISM]: ['https://rpc.ankr.com/optimism'],
  [SupportedChainId.OPTIMISTIC_KOVAN]: ['https://kovan.optimism.io'],
  // [SupportedChainId.CELO]: ['https://rpc.ankr.com/celo'], // TODO: need to add support for Celo
}
