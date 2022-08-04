import { useWeb3React } from '@web3-react/core'
import { ALL_SUPPORTED_CHAIN_IDS } from 'constants/chains'
import { useMemo } from 'react'

function useOnSupportedNetwork() {
  const { chainId } = useWeb3React()
  return useMemo(() => Boolean(chainId && ALL_SUPPORTED_CHAIN_IDS.includes(chainId)), [chainId])
}

export default useOnSupportedNetwork
