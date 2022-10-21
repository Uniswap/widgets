import { useWeb3React } from '@web3-react/core'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import { useMemo } from 'react'

function useOnSupportedNetwork(chainId?: SupportedChainId) {
  const { chainId: activeChainId } = useWeb3React()

  chainId = chainId || activeChainId

  return useMemo(() => Boolean(chainId && ALL_SUPPORTED_CHAIN_IDS.includes(chainId)), [chainId])
}

export default useOnSupportedNetwork
