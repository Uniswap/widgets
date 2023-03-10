import { useWeb3React } from '@web3-react/core'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useWETHContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { Field, swapAtom, swapEventHandlersAtom } from 'state/swap'
import { TransactionType, UnwrapTransactionInfo, WrapTransactionInfo } from 'state/transactions'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'

interface UseWrapCallbackReturns {
  callback: () => Promise<WrapTransactionInfo | UnwrapTransactionInfo | void>
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

  const wrapCallback = useCallback(async (): Promise<WrapTransactionInfo | UnwrapTransactionInfo | void> => {
    if (!parsedAmountIn || !wrappedNativeCurrencyContract) return
    switch (wrapType) {
      case TransactionType.WRAP:
        return {
          response: await wrappedNativeCurrencyContract.deposit({ value: `0x${parsedAmountIn.quotient.toString(16)}` }),
          type: TransactionType.WRAP,
          amount: parsedAmountIn,
        }
      case TransactionType.UNWRAP:
        return {
          response: await wrappedNativeCurrencyContract.withdraw(`0x${parsedAmountIn.quotient.toString(16)}`),
          type: TransactionType.WRAP,
          amount: parsedAmountIn,
        }
      case undefined:
        return undefined
    }
  }, [parsedAmountIn, wrappedNativeCurrencyContract, wrapType])

  const { onWrapSend } = useAtomValue(swapEventHandlersAtom)
  const callback = useCallback(() => {
    const wrap = wrapCallback?.()
    if (parsedAmountIn) {
      onWrapSend?.(parsedAmountIn, wrap)
    }
    return wrap
  }, [onWrapSend, parsedAmountIn, wrapCallback])

  return useMemo(() => ({ callback, type: wrapType }), [callback, wrapType])
}
