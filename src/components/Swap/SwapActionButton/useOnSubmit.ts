import { useSwapAmount } from 'hooks/swap'
import { useAddTransactionInfo } from 'hooks/transactions'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'
import { displayTxHashAtom, Field } from 'state/swap'
import { TransactionInfo, TransactionType } from 'state/transactions'
import { isAnimating } from 'utils/animations'

/** Submits a transaction. Returns true if the transaction was submitted. */
export default function useOnSubmit() {
  const addTransactionInfo = useAddTransactionInfo()
  const setDisplayTxHash = useUpdateAtom(displayTxHashAtom)
  const [, setInputAmount] = useSwapAmount(Field.INPUT)

  return useCallback(
    async (submit: () => Promise<TransactionInfo | undefined>): Promise<boolean> => {
      let info: TransactionInfo | undefined
      try {
        info = await submit()
      } catch (e) {
        console.error('Failed to submit', e)
      }
      if (!info) return false

      addTransactionInfo(info)

      // For actionable transactions, display the tx and reset the input.
      switch (info.type) {
        case TransactionType.SWAP:
        case TransactionType.WRAP:
        case TransactionType.UNWRAP:
          setDisplayTxHash(info.response.hash)

          if (isAnimating(document)) {
            // Only reset the input amount after any queued animations to avoid layout thrashing,
            // because a successful submit will open the status dialog and immediately cover input.
            return new Promise((resolve) => {
              const onAnimationEnd = () => {
                document.removeEventListener('animationend', onAnimationEnd)
                setInputAmount('')
              }
              document.addEventListener('animationend', onAnimationEnd)
            })
          } else {
            setInputAmount('')
          }
      }

      return true
    },
    [addTransactionInfo, setDisplayTxHash, setInputAmount]
  )
}
