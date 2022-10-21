import { useWeb3React } from '@web3-react/core'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import { useMemo } from 'react'

function useOnSupportedNetwork(chainId?: SupportedChainId) {
  let { chainId: _chainId } = useWeb3React()

  if (chainId) {
    _chainId = chainId
  }
  return useMemo(() => Boolean(_chainId && ALL_SUPPORTED_CHAIN_IDS.includes(_chainId)), [_chainId])
}

export default useOnSupportedNetwork
