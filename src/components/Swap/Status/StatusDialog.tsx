import { Trans } from '@lingui/macro'
import ErrorDialog, { StatusHeader } from 'components/Error/ErrorDialog'
import SwapSummary from 'components/Swap/Summary'
import { MS_IN_SECOND } from 'constants/misc'
import { LargeArrow, LargeCheck, LargeSpinner } from 'icons'
import { useEffect, useMemo, useState } from 'react'
import { Transaction, TransactionType } from 'state/transactions'
import { ThemedText, TransitionDuration } from 'theme'

import ActionButton from '../../ActionButton'
import Column from '../../Column'

interface TransactionStatusProps {
  tx: Transaction
  dstTxHash?: string
  onClose: () => void
}

function TransactionStatus({ tx, onClose, dstTxHash }: TransactionStatusProps) {
  const [showConfirmation, setShowConfirmation] = useState(true)
  const Icon = useMemo(() => {
    if (showConfirmation) {
      return LargeArrow
    }
    return tx.receipt?.status && dstTxHash ? LargeCheck : LargeSpinner
  }, [showConfirmation, tx.receipt?.status, dstTxHash])

  useEffect(() => {
    // We should show the confirmation for 1 second,
    // which should start after the entrance animation is complete.
    const handle = setTimeout(() => {
      setShowConfirmation(false)
    }, MS_IN_SECOND + TransitionDuration.Medium)
    return () => {
      clearTimeout(handle)
    }
  }, [])

  const heading = useMemo(() => {
    if (showConfirmation) {
      return <Trans>Transaction submitted</Trans>
    } else if (tx.info.type === TransactionType.SWAP) {
      return tx.receipt?.status && dstTxHash ? <Trans>Success</Trans> : <Trans>Zap pending</Trans>
    } else if (tx.info.type === TransactionType.WRAP) {
      return tx.receipt?.status ? <Trans>Success</Trans> : <Trans>Unwrap pending</Trans>
    } else if (tx.info.type === TransactionType.UNWRAP) {
      return tx.receipt?.status ? <Trans>Success</Trans> : <Trans>Unwrap pending</Trans>
    }
    return tx.receipt?.status ? <Trans>Success</Trans> : <Trans>Transaction pending</Trans>
  }, [showConfirmation, tx.info.type, tx.receipt?.status, dstTxHash])

  const subheading = useMemo(() => {
    if (tx.receipt?.status && !dstTxHash) {
      return <Trans>Waiting for the second transaction...</Trans>
    }
    if (tx.receipt?.status && dstTxHash) {
      return <Trans>Your transaction was successful</Trans>
    }
    return <Trans>Waiting for the first transaction...</Trans>
  }, [tx.receipt?.status, dstTxHash])

  return (
    <Column flex padded gap={0.75} align="stretch" style={{ height: '100%' }}>
      <StatusHeader icon={Icon} iconColor={tx.receipt?.status ? 'success' : undefined}>
        <ThemedText.H4>{heading}</ThemedText.H4>
        {tx.info.type === TransactionType.SWAP ? (
          <SwapSummary
            input={tx.info.trade.inputAmount}
            output={tx.info.trade.outputAmount}
            srcTxHash={tx.info.response.hash}
            dstTxHash={dstTxHash}
          />
        ) : null}
        <ThemedText.Subhead1>{subheading}</ThemedText.Subhead1>
      </StatusHeader>
      <ActionButton onClick={onClose}>
        <Trans>Close</Trans>
      </ActionButton>
    </Column>
  )
}

export default function TransactionStatusDialog({ tx, onClose, dstTxHash }: TransactionStatusProps) {
  return tx.receipt?.status === 0 ? (
    <ErrorDialog
      header={<Trans>Your swap failed.</Trans>}
      message={
        <Trans>
          Try increasing your slippage tolerance.
          <br />
          NOTE: Fee on transfer and rebase tokens are incompatible with Uniswap V3.
        </Trans>
      }
      action={<Trans>Dismiss</Trans>}
      onClick={onClose}
    />
  ) : (
    <TransactionStatus tx={tx} dstTxHash={dstTxHash} onClose={onClose} />
  )
}
