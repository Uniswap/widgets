import { ContractTransaction } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useWETHContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { Field, swapAtom } from 'state/swap'
import { TransactionType } from 'state/transactions'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'

import useCurrencyBalance from '../useCurrencyBalance'

export default function useWrapCallback(
  wrapType?: TransactionType.WRAP | TransactionType.UNWRAP
): () => Promise<ContractTransaction | void> {
  const { account } = useWeb3React()
  const wrappedNativeCurrencyContract = useWETHContract()
  const { amount, [Field.INPUT]: inputCurrency } = useAtomValue(swapAtom)

  const parsedAmountIn = useMemo(
    () => tryParseCurrencyAmount(amount, inputCurrency ?? undefined),
    [inputCurrency, amount]
  )
  const balanceIn = useCurrencyBalance(account, inputCurrency)

  return useMemo(() => {
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
}
