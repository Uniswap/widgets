import { SupportedChainId } from 'constants/chains'

const ETHERSCAN_PREFIXES: { [chainId: number]: string } = {
  [SupportedChainId.MAINNET]: 'https://etherscan.io',
  [SupportedChainId.GOERLI]: 'https://goerli.etherscan.io',
  [SupportedChainId.ARBITRUM_ONE]: 'https://arbiscan.io',
  [SupportedChainId.ARBITRUM_GOERLI]: 'https://goerli.arbiscan.io',
  [SupportedChainId.OPTIMISM]: 'https://optimistic.etherscan.io',
  [SupportedChainId.OPTIMISM_GOERLI]: 'https://goerli-optimism.etherscan.io',
  [SupportedChainId.POLYGON]: 'https://polygonscan.com',
  [SupportedChainId.CELO]: 'https://celoscan.io',
}

export enum ExplorerDataType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  ADDRESS = 'address',
  BLOCK = 'block',
}

/**
 * Return the explorer link for the given data and data type
 * @param chainId the ID of the chain for which to return the data
 * @param data the data to return a link for
 * @param type the type of the data
 */
export function getExplorerLink(chainId: number, data: string, type: ExplorerDataType): string {
  const prefix = ETHERSCAN_PREFIXES[chainId] ?? 'https://etherscan.io'

  if (chainId === SupportedChainId.ARBITRUM_ONE || chainId === SupportedChainId.ARBITRUM_GOERLI) {
    switch (type) {
      case ExplorerDataType.TRANSACTION:
        return `${prefix}/tx/${data}`
      case ExplorerDataType.ADDRESS:
      case ExplorerDataType.TOKEN:
        return `${prefix}/address/${data}`
      case ExplorerDataType.BLOCK:
        return `${prefix}/block/${data}`
      default:
        return `${prefix}/`
    }
  }

  switch (type) {
    case ExplorerDataType.TRANSACTION:
      return `${prefix}/tx/${data}`

    case ExplorerDataType.TOKEN:
      return `${prefix}/token/${data}`

    case ExplorerDataType.BLOCK:
      if (chainId === SupportedChainId.OPTIMISM || chainId === SupportedChainId.OPTIMISM_GOERLI) {
        return `${prefix}/tx/${data}`
      }
      return `${prefix}/block/${data}`

    case ExplorerDataType.ADDRESS:
      return `${prefix}/address/${data}`
    default:
      return `${prefix}`
  }
}
