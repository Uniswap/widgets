import { useWeb3React } from '@web3-react/core'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { Field, swapAtom } from 'state/swap'
import { TransactionType } from 'state/transactions'

export function useWrapType(): TransactionType.WRAP | TransactionType.UNWRAP | undefined {
  const { chainId } = useWeb3React()
  const { [Field.INPUT]: inputCurrency, [Field.OUTPUT]: outputCurrency } = useAtomValue(swapAtom)
  return useMemo(() => {
    if (chainId && inputCurrency && outputCurrency) {
      if (inputCurrency.isNative && WRAPPED_NATIVE_CURRENCY[chainId]?.equals(outputCurrency)) {
        return TransactionType.WRAP
      }
      if (outputCurrency.isNative && WRAPPED_NATIVE_CURRENCY[chainId]?.equals(inputCurrency)) {
        return TransactionType.UNWRAP
      }
    }
    return undefined
  }, [chainId, inputCurrency, outputCurrency])
}

export function useIsWrap(): boolean {
  return useWrapType() !== undefined
}
