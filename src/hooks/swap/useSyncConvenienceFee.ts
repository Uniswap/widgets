import { Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { feeOptionsAtom } from 'state/swap'

export interface FeeOptions {
  convenienceFee?: number
  convenienceFeeRecipient?: string | string | { [chainId: number]: string }
}

export default function useSyncConvenienceFee({ convenienceFee, convenienceFeeRecipient }: FeeOptions) {
  const { chainId } = useWeb3React()
  const updateFeeOptions = useUpdateAtom(feeOptionsAtom)

  useEffect(() => {
    if (convenienceFee && convenienceFeeRecipient) {
      if (typeof convenienceFeeRecipient === 'string') {
        updateFeeOptions({
          fee: new Percent(convenienceFee, 10_000),
          recipient: convenienceFeeRecipient,
        })
        return
      }
      if (chainId && convenienceFeeRecipient[chainId]) {
        updateFeeOptions({
          fee: new Percent(convenienceFee, 10_000),
          recipient: convenienceFeeRecipient[chainId],
        })
        return
      }
    }
    updateFeeOptions(undefined)
  }, [chainId, convenienceFee, convenienceFeeRecipient, updateFeeOptions])
}
