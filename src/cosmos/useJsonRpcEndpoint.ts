import { SupportedChainId } from '../index'
import useOption from './useOption'

const INFURA_KEY = process.env.INFURA_KEY
if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`INFURA_KEY must be a defined environment variable`)
}

export const INFURA_NETWORK_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.KOVAN]: `https://kovan.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.OPTIMISM]: `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.OPTIMISTIC_KOVAN]: `https://optimism-kovan.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ARBITRUM_ONE]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ARBITRUM_RINKEBY]: `https://arbitrum-rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.POLYGON]: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.POLYGON_MUMBAI]: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
}

export default function useJsonRpcEndpoint() {
  const endpoints = Object.entries(INFURA_NETWORK_URLS).reduce(
    (acc, [chainId, url]) => ({
      ...acc,
      [SupportedChainId[chainId]]: url,
    }),
    {}
  )
  return useOption<string>('jsonRpcEndpoint', {
    options: endpoints,
    defaultValue: SupportedChainId[SupportedChainId.MAINNET],
  })
}
