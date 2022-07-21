import { SupportedChainId } from './chains'

/**
 * Fallback JSON RPC endpoints if integrator does not provide one
 */
export const JSON_RPC_FALLBACK_ENDPOINTS: { [key in SupportedChainId]?: string[] } = {
  [SupportedChainId.MAINNET]: ['https://cloudflare-eth.com'],
  [SupportedChainId.RINKEBY]: ['https://cloudflare-eth.com/v1/rinkeby'],
}
