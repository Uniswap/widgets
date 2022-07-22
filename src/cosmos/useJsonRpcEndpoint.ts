import { SupportedChainId } from '@uniswap/widgets'

import useOption, { NONE } from './useOption'

const INFURA_KEY = process.env.INFURA_KEY
if (INFURA_KEY === undefined) {
  console.warn(`INFURA_KEY must be a defined environment variable to use JsonRpcEndpoints in the cosmos viewer`)
}

export const INFURA_NETWORK_URLS: { [key in SupportedChainId]?: string } = INFURA_KEY
  ? {
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
  : {}

export default function useJsonRpcEndpoint() {
  const endpoints = Object.entries(INFURA_NETWORK_URLS).reduce<{ [chainId: string]: string }>(
    (acc, [chainId, url]) => ({
      ...acc,
      [SupportedChainId[Number(chainId)]]: url,
    }),
    {}
  )

  return useOption('jsonRpcEndpoint', {
    options: endpoints,
    defaultValue: INFURA_NETWORK_URLS[SupportedChainId.MAINNET] ? SupportedChainId[SupportedChainId.MAINNET] : NONE,
  })
}
