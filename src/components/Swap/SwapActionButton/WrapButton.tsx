import { Trans } from '@lingui/macro'
import { useAsyncError } from 'components/Error/ErrorBoundary'
import useWrapCallback from 'hooks/swap/useWrapCallback'
import useNativeCurrency from 'hooks/useNativeCurrency'
import useTokenColorExtraction from 'hooks/useTokenColorExtraction'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TransactionType } from 'state/transactions'

import ActionButton from '../../ActionButton'
import useOnSubmit from './useOnSubmit'

/**
 * A wrapping ActionButton.
 * Should only be rendered if a valid wrap exists.
 */
export default function WrapButton({ disabled }: { disabled: boolean }) {
  const { type: wrapType, callback: wrapCallback } = useWrapCallback()
  const color = useTokenColorExtraction()

  const [isPending, setIsPending] = useState(false)
  // Reset the pending state if user updates the wrap.
  useEffect(() => setIsPending(false), [wrapCallback])

  const native = useNativeCurrency()
  const inputCurrency = wrapType === TransactionType.WRAP ? native : native.wrapped
  const onSubmit = useOnSubmit()

  const throwAsync = useAsyncError()
  const onWrap = useCallback(async () => {
    setIsPending(true)
    try {
      await onSubmit(wrapCallback)
    } catch (e) {
      throwAsync(e)
    } finally {
      setIsPending(false)
    }
  }, [onSubmit, throwAsync, wrapCallback])

  const actionProps = useMemo(
    () =>
      isPending
        ? { action: { message: <Trans>Confirm in your wallet</Trans>, icon: Spinner, hideButton: true } }
        : { onClick: onWrap },
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
