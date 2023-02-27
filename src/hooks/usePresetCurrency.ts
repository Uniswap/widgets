import { Currency } from '@uniswap/sdk-core'
import { useEffect, useState } from 'react'

import { useChainTokenMapContext } from './useTokenList'

export default function usePresetCurrency(chainId?: number, address?: string) {
  const [presetCurrency, updatePresetCurrency] = useState<Currency>()
  const chainTokenMap = useChainTokenMapContext()

  useEffect(() => {
    if (chainId && address && chainTokenMap[chainId] && chainTokenMap[chainId][address].token) {
      updatePresetCurrency(chainTokenMap[chainId][address].token)
    } else {
      updatePresetCurrency(undefined)
    }
  }, [chainId, address, updatePresetCurrency, chainTokenMap])

  return presetCurrency
}
