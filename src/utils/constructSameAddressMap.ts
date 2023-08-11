import { ChainId } from '@uniswap/sdk-core'

const DEFAULT_NETWORKS = [ChainId.MAINNET, ChainId.GOERLI]

export function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks: ChainId[] = []
): { [chainId: number]: T } {
  return DEFAULT_NETWORKS.concat(additionalNetworks).reduce<{ [chainId: number]: T }>((memo, chainId) => {
    memo[chainId] = address
    return memo
  }, {})
}
