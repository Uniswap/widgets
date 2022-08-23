import { ContractTransaction } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useWETHContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { Field, swapAtom } from 'state/swap'
import { TransactionType } from 'state/transactions'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'

import useCurrencyBalance from '../useCurrencyBalance'

interface UseWrapCallbackReturns {
  callback: () => Promise<ContractTransaction | void>
  type?: TransactionType.WRAP | TransactionType.UNWRAP
  isWrap: boolean
}

export default function useWrapCallback(): UseWrapCallbackReturns {
  const { account, chainId } = useWeb3React()
  const wrappedNativeCurrencyContract = useWETHContract()
  const { amount, [Field.INPUT]: inputCurrency, [Field.OUTPUT]: outputCurrency } = useAtomValue(swapAtom)

  const type = useMemo(() => {
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

  const parsedAmountIn = useMemo(
    () => tryParseCurrencyAmount(amount, inputCurrency ?? undefined),
    [inputCurrency, amount]
  )
  const balanceIn = useCurrencyBalance(account, inputCurrency)

  const callback = useMemo(() => {
    if (!parsedAmountIn || !balanceIn || balanceIn.lessThan(parsedAmountIn) || !wrappedNativeCurrencyContract) {
      return async () => undefined
    }

    return async () => {
      switch (type) {
        case TransactionType.WRAP:
          return wrappedNativeCurrencyContract.deposit({ value: `0x${parsedAmountIn.quotient.toString(16)}` })
        case TransactionType.UNWRAP:
          return wrappedNativeCurrencyContract.withdraw(`0x${parsedAmountIn.quotient.toString(16)}`)
        case undefined:
          return undefined
      }
    }
  }, [type, parsedAmountIn, balanceIn, wrappedNativeCurrencyContract])

  return useMemo(() => ({ callback, type, isWrap: type !== undefined }), [callback, type])
}

export function useIsWrap() {
  return useWrapCallback().isWrap
}
