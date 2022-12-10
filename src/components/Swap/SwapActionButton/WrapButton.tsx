import { Trans } from '@lingui/macro'
import { CurrencyAmount } from '@uniswap/sdk-core'
import useWrapCallback from 'hooks/swap/useWrapCallback'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TransactionType, UnwrapTransactionInfo, WrapTransactionInfo } from 'state/transactions'
import { Colors } from 'theme'
import invariant from 'tiny-invariant'

import ActionButton from '../../ActionButton'

/**
 * A wrapping ActionButton.
 * Should only be rendered if a valid wrap exists.
 */
export default function WrapButton({
  color,
  disabled,
  onSubmit,
}: {
  color: keyof Colors
  disabled: boolean
  onSubmit: (submit: () => Promise<WrapTransactionInfo | UnwrapTransactionInfo | void>) => Promise<void>
}) {
  const { type: wrapType, callback: wrapCallback } = useWrapCallback()

  const [isPending, setIsPending] = useState(false)
  // Reset the pending state if user updates the wrap.
  useEffect(() => setIsPending(false), [wrapCallback])

  const native = useNativeCurrency()
  const inputCurrency = wrapType === TransactionType.WRAP ? native : native.wrapped
  const onWrap = useCallback(async () => {
    setIsPending(true)
    try {
      await onSubmit(async () => {
        const response = await wrapCallback()
        if (!response) return

        invariant(wrapType !== undefined) // if response is valid, then so is wrapType
        const amount = CurrencyAmount.fromRawAmount(native, response.value?.toString() ?? '0')
        return { response, type: wrapType, amount }
      })
    } catch (e) {
      console.error(e) // ignore error
    } finally {
      setIsPending(false)
    }
  }, [native, onSubmit, wrapCallback, wrapType])

  const actionProps = useMemo(
    () =>
      isPending ? { action: { message: <Trans>Confirm in your wallet</Trans>, icon: Spinner } } : { onClick: onWrap },
    [isPending, onWrap]
  )

  return (
    <ActionButton color={color} {...actionProps} disabled={disabled || isPending}>
      <Trans>
        {wrapType === TransactionType.WRAP ? 'Wrap' : 'Unwrap'} {inputCurrency?.symbol}
      </Trans>
    </ActionButton>
  )
}
