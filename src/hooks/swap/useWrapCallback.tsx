import { ContractTransaction } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useWETHContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { Field, swapAtom } from 'state/swap'
import { TransactionType } from 'state/transactions'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'

interface UseWrapCallbackReturns {
  callback: () => Promise<ContractTransaction | void>
  type?: TransactionType.WRAP | TransactionType.UNWRAP
}

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

export default function useWrapCallback(): UseWrapCallbackReturns {
  const wrappedNativeCurrencyContract = useWETHContract()
  const { amount, [Field.INPUT]: inputCurrency } = useAtomValue(swapAtom)
  const wrapType = useWrapType()

  const parsedAmountIn = useMemo(
    () => tryParseCurrencyAmount(amount, inputCurrency ?? undefined),
    [inputCurrency, amount]
  )

  const callback = useMemo(() => {
    return async () => {
      if (!parsedAmountIn) return
      switch (wrapType) {
        case TransactionType.WRAP:
          return wrappedNativeCurrencyContract?.deposit({ value: `0x${parsedAmountIn.quotient.toString(16)}` })
        case TransactionType.UNWRAP:
          return wrappedNativeCurrencyContract?.withdraw(`0x${parsedAmountIn.quotient.toString(16)}`)
        case undefined:
          return undefined
      }
    }
  }, [parsedAmountIn, wrappedNativeCurrencyContract, wrapType])

  return useMemo(() => ({ callback, type: wrapType }), [callback, wrapType])
}
