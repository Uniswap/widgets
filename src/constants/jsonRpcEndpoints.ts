import { SupportedChainId } from './chains'

/**
 * Fallback JSON RPC endpoints.
 * These are used if the integrator does not provide an endpoint, or if the endpoint does not work.
 *
 * MetaMask allows switching to any URL, but displays a warning if it is not on the "Safe" list:
 * https://github.com/MetaMask/metamask-mobile/blob/bdb7f37c90e4fc923881a07fca38d4e77c73a579/app/core/RPCMethods/wallet_addEthereumChain.js#L228-L235
 * https://chainid.network/chains.json
 *
 * These "Safe" URLs are listed first, followed by other fallback URLs, which are taken from chainlist.org.
 */
export const JSON_RPC_FALLBACK_ENDPOINTS: Record<SupportedChainId, string[]> = {
  [SupportedChainId.MAINNET]: [
    // "Safe" URLs
    'https://cloudflare-eth.com',
    // "Fallback" URLs
    'https://rpc.ankr.com/eth',
    'https://eth-mainnet.public.blastapi.io',
  ],
  [SupportedChainId.ROPSTEN]: [
    // "Fallback" URLs
    'https://rpc.ankr.com/eth_ropsten',
  ],
  [SupportedChainId.RINKEBY]: [
    // "Fallback" URLs
    'https://rinkeby-light.eth.linkpool.io/',
  ],
  [SupportedChainId.GOERLI]: [
    // "Safe" URLs
    'https://rpc.goerli.mudit.blog/',
    // "Fallback" URLs
    'https://rpc.ankr.com/eth_goerli',
  ],
  [SupportedChainId.KOVAN]: [
    // "Fallback" URLs
    'https://eth-kovan.public.blastapi.io',
  ],
  [SupportedChainId.POLYGON]: [
    // "Safe" URLs
    'https://polygon-rpc.com/',
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    // "Safe" URLs
    'https://matic-mumbai.chainstacklabs.com',
    'https://rpc-mumbai.maticvigil.com',
    'https://matic-testnet-archive-rpc.bwarelabs.com',
  ],
  [SupportedChainId.ARBITRUM_ONE]: [
    // "Safe" URLs
    'https://arb1.arbitrum.io/rpc',
    // "Fallback" URLs
    'https://arbitrum.public-rpc.com',
  ],
  [SupportedChainId.ARBITRUM_RINKEBY]: [
    // "Safe" URLs
    'https://rinkeby.arbitrum.io/rpc',
  ],
  [SupportedChainId.OPTIMISM]: [
    // "Safe" URLs
    'https://mainnet.optimism.io/',
    // "Fallback" URLs
    'https://rpc.ankr.com/optimism',
  ],
  [SupportedChainId.OPTIMISM_GOERLI]: [
    // "Safe" URLs
    'https://goerli.optimism.io',
  ],
  [SupportedChainId.CELO]: [
    // "Safe" URLs
    'https://forno.celo.org',
  ],
  [SupportedChainId.CELO_ALFAJORES]: [
    // "Safe" URLs
    'https://alfajores-forno.celo-testnet.org',
  ],
  [SupportedChainId.STARKNET]: [],
  [SupportedChainId.STARKNET_GOERLI]: [],
  [SupportedChainId.FANTOM]: [],
  [SupportedChainId.AURORA]: [
    // "Safe" URLs
    'https://mainnet.aurora.dev',
  ],
  [SupportedChainId.AURORA_TESTNET]: [
    // "Safe" URLs
    'https://testnet.aurora.dev',
  ],
  [SupportedChainId.BSC]: [
    // "Safe" URLs
    'https://bsc-dataseed.binance.org',
  ],
  [SupportedChainId.AVALANCHE]: [
    // "Safe" URLs
    'https://avalanche-c-chain.publicnode.com',
  ],
}
