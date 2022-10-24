import { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import EtherscanLink from 'components/EtherscanLink'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { usePendingApproval } from 'hooks/transactions'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { ApprovalTransactionInfo, TransactionType } from 'state/transactions'
import { Colors } from 'theme'
import { ExplorerDataType } from 'utils/getExplorerLink'

/**
 * An approving ActionButton.
 * Should only be rendered if a valid trade exists that is not yet approved.
 */
export default function ApproveButton({
  color,
  trade,
  state,
  approve,
  onSubmit,
}: {
  color: keyof Colors
  trade?: InterfaceTrade
  state: SwapApprovalState
  approve?: () => Promise<{
    response: TransactionResponse
    tokenAddress: string
    spenderAddress: string
  } | void>
  onSubmit: (submit: () => Promise<ApprovalTransactionInfo | undefined>) => Promise<boolean>
}) {
  const [isPending, setIsPending] = useState(false)
  const onApprove = useCallback(async () => {
    setIsPending(true)
    await onSubmit(async () => {
      const info = await approve?.()
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
    switch (state) {
      case SwapApprovalState.REQUIRES_APPROVAL:
        if (isPending) {
          return { message: <Trans>Approve in your wallet</Trans>, icon: Spinner }
        }
        return {
          message: <Trans>Approve {symbol} first</Trans>,
          onClick: onApprove,
          children: <Trans>Approve</Trans>,
        }
      case SwapApprovalState.REQUIRES_SIGNATURE:
        if (isPending) {
          return { message: <Trans>Allow in your wallet</Trans>, icon: Spinner }
        }
        return {
          message: <Trans>Allow {symbol} first</Trans>,
          onClick: onApprove,
          children: <Trans>Allow</Trans>,
        }
      case SwapApprovalState.PENDING_APPROVAL:
        return {
          message: (
            <EtherscanLink type={ExplorerDataType.TRANSACTION} data={pendingApprovalHash}>
              <Trans>Approval pending</Trans>
            </EtherscanLink>
          ),
          icon: Spinner,
        }
      case SwapApprovalState.PENDING_SIGNATURE:
        return { message: <Trans>Allowance pending</Trans>, icon: Spinner }
      default:
        return
    }
  }, [isPending, onApprove, pendingApprovalHash, state, symbol])

  return <ActionButton color={color} action={actionProps} />
}
