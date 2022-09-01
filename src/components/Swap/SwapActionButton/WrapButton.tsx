import { Trans } from '@lingui/macro'
import { CurrencyAmount } from '@uniswap/sdk-core'
import useWrapCallback from 'hooks/swap/useWrapCallback'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TransactionType, UnwrapTransactionInfo, WrapTransactionInfo } from 'state/transactions'
import { useTheme } from 'styled-components/macro'
import invariant from 'tiny-invariant'

import ActionButton from '../../ActionButton'

/**
 * A wrapping ActionButton.
 * Should only be rendered if a valid wrap exists.
 */
export default function WrapButton({
  onSubmit,
}: {
  onSubmit: (submit: () => Promise<WrapTransactionInfo | UnwrapTransactionInfo | undefined>) => Promise<boolean>
}) {
  const { type: wrapType, callback: wrapCallback } = useWrapCallback()

  const [isPending, setIsPending] = useState(false)
  // Reset the pending state if user updates the wrap.
  useEffect(() => setIsPending(false), [wrapCallback])

  const native = useNativeCurrency()
  const inputCurrency = wrapType === TransactionType.WRAP ? native : native.wrapped
  const onWrap = useCallback(async () => {
    setIsPending(true)
    await onSubmit(async () => {
      const response = await wrapCallback()
      if (!response) return

      invariant(wrapType !== undefined) // if response is valid, then so is wrapType
      const amount = CurrencyAmount.fromRawAmount(native, response.value?.toString() ?? '0')
      return { response, type: wrapType, amount }
    })

    // Whether or not the transaction submits, reset the pending state.
    setIsPending(false)
  }, [native, onSubmit, wrapCallback, wrapType])

  const { tokenColorExtraction } = useTheme()
  const actionProps = useMemo(
    () =>
      isPending ? { action: { message: <Trans>Confirm in your wallet</Trans>, icon: Spinner } } : { onClick: onWrap },
    [isPending, onWrap]
  )

  return (
    <ActionButton color={tokenColorExtraction ? 'interactive' : 'accent'} {...actionProps}>
      <Trans>
        {wrapType === TransactionType.WRAP ? 'WRAP' : 'UNWRAP'} {inputCurrency?.symbol}
      </Trans>
    </ActionButton>
  )
}
