import { useSigner } from 'components/SignerProvider'
import { ALL_SUPPORTED_CHAIN_IDS } from 'constants/chains'
import { useMemo } from 'react'

function useOnSupportedNetwork() {
  const { chainId } = useSigner()
  return useMemo(() => Boolean(chainId && ALL_SUPPORTED_CHAIN_IDS.includes(chainId)), [chainId])
}

export default useOnSupportedNetwork
