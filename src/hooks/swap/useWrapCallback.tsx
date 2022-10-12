import { ContractTransaction } from '@ethersproject/contracts'
import { useSigner } from 'components/SignerProvider'
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
}

export function useWrapType(): TransactionType.WRAP | TransactionType.UNWRAP | undefined {
  const { chainId } = useSigner()
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
  const { account } = useSigner()
  const wrappedNativeCurrencyContract = useWETHContract()
  const { amount, [Field.INPUT]: inputCurrency } = useAtomValue(swapAtom)
  const wrapType = useWrapType()

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
      switch (wrapType) {
        case TransactionType.WRAP:
          return wrappedNativeCurrencyContract.deposit({ value: `0x${parsedAmountIn.quotient.toString(16)}` })
        case TransactionType.UNWRAP:
          return wrappedNativeCurrencyContract.withdraw(`0x${parsedAmountIn.quotient.toString(16)}`)
        case undefined:
          return undefined
      }
    }
  }, [parsedAmountIn, balanceIn, wrappedNativeCurrencyContract, wrapType])

  return useMemo(() => ({ callback, type: wrapType }), [callback, wrapType])
}
