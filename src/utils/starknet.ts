import { SupportedChainId } from '..'

export function isStarknet(chainId?: number): boolean {
  if (!chainId) return false

  return [SupportedChainId.STARKNET, SupportedChainId.STARKNET_GOERLI].includes(chainId)
}
