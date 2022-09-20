import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import EtherscanLink from 'components/EtherscanLink'
import { ApprovalState, useApprovalCallback } from 'hooks/swap/useApproval'
import useSwapInfo from 'hooks/swap/useSwapInfo'
import { usePendingApproval } from 'hooks/transactions'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApprovalTransactionInfo, TransactionType } from 'state/transactions'
import { Colors } from 'theme'
import { ExplorerDataType } from 'utils/getExplorerLink'

/**
 * An approving ActionButton.
 * Should only be rendered if a valid trade exists that is not yet approved.
 */
export default function ApproveButton({
  color,
  onSubmit,
}: {
  color: keyof Colors
  onSubmit: (submit: () => Promise<ApprovalTransactionInfo | undefined>) => Promise<boolean>
}) {
  const {
    approval,
    trade: { trade },
    slippage,
  } = useSwapInfo()
  const approve = useApprovalCallback(trade, slippage.allowed, approval)

  const [isPending, setIsPending] = useState(false)
  const onApprove = useCallback(async () => {
    setIsPending(true)
    await onSubmit(async () => {
      const info = await approve()
      if (!info) return

      return { type: TransactionType.APPROVAL, ...info }
    })
    setIsPending(false)
  }, [approve, onSubmit])

  const currency = trade?.inputAmount?.currency
  const symbol = currency?.symbol || ''

  // Reset the pending state if currency changes.
  useEffect(() => setIsPending(false), [currency])

  const pendingApprovalHash = usePendingApproval(currency?.isToken ? currency : undefined)

  const actionProps = useMemo(() => {
    switch (approval.state) {
      case ApprovalState.REQUIRES_ALLOWANCE:
        if (isPending) {
          return { message: <Trans>Approve in your wallet</Trans>, icon: Spinner }
        }
        return {
          message: <Trans>Approve {symbol} first</Trans>,
          onClick: onApprove,
          children: <Trans>Approve</Trans>,
        }
      case ApprovalState.REQUIRES_SIGNATURE:
        if (isPending) {
          return { message: <Trans>Allow in your wallet</Trans>, icon: Spinner }
        }
        return {
          message: <Trans>Allow {symbol} first</Trans>,
          onClick: onApprove,
          children: <Trans>Allow</Trans>,
        }
      case ApprovalState.PENDING_ALLOWANCE:
        return {
          message: (
            <EtherscanLink type={ExplorerDataType.TRANSACTION} data={pendingApprovalHash}>
              <Trans>Approval pending</Trans>
            </EtherscanLink>
          ),
          icon: Spinner,
        }
      case ApprovalState.PENDING_SIGNATURE:
        return { message: <Trans>Allowance pending</Trans>, icon: Spinner }
      default:
        return
    }
  }, [approval.state, symbol, isPending, onApprove, pendingApprovalHash])

  return <ActionButton color={color} action={actionProps} />
}
