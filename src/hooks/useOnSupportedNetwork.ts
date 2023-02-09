import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import { useEvmChainId } from 'hooks/useSyncWidgetSettings'
import { useMemo } from 'react'

function useOnSupportedNetwork(chainId?: SupportedChainId) {
  const activeChainId = useEvmChainId()

  chainId = chainId || activeChainId

  return useMemo(() => Boolean(chainId && ALL_SUPPORTED_CHAIN_IDS.includes(chainId)), [chainId])
}

export default useOnSupportedNetwork
