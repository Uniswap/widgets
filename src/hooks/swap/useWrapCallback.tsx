import { useWeb3React } from '@web3-react/core'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { DismissableError, UserRejectedRequestError, WidgetPromise } from 'errors'
import { useWETHContract } from 'hooks/useContract'
import { usePerfEventHandler } from 'hooks/usePerfEventHandler'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { Field, swapAtom } from 'state/swap'
import { TransactionType, UnwrapTransactionInfo, WrapTransactionInfo } from 'state/transactions'
import { isUserRejection } from 'utils/jsonRpcError'
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

  const wrapCallback = useCallback(
    () =>
      WidgetPromise.from(
        async () => {
          if (!parsedAmountIn) throw new Error('missing amount')
          if (!wrappedNativeCurrencyContract) throw new Error('missing contract')
          if (wrapType === undefined) throw new Error('missing wrapType')
          switch (wrapType) {
            case TransactionType.WRAP:
              return {
                response: await wrappedNativeCurrencyContract.deposit({
                  value: `0x${parsedAmountIn.quotient.toString(16)}`,
                }),
                type: TransactionType.WRAP,
                amount: parsedAmountIn,
              } as WrapTransactionInfo
            case TransactionType.UNWRAP:
              return {
                response: await wrappedNativeCurrencyContract.withdraw(`0x${parsedAmountIn.quotient.toString(16)}`),
                type: TransactionType.UNWRAP,
                amount: parsedAmountIn,
              } as UnwrapTransactionInfo
          }
        },
        null,
        (error) => {
          if (isUserRejection(error)) throw new UserRejectedRequestError()
          throw new DismissableError({ message: (error as any)?.message ?? error, error })
        }
      ),
    [parsedAmountIn, wrappedNativeCurrencyContract, wrapType]
  )

  const args = useMemo(() => parsedAmountIn && { amount: parsedAmountIn }, [parsedAmountIn])
  const callback = usePerfEventHandler('onWrapSend', args, wrapCallback)

  return useMemo(() => ({ callback, type: wrapType }), [callback, wrapType])
}
