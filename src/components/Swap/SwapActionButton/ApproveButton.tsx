import { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import ActionButton from 'components/ActionButton'
import EtherscanLink from 'components/EtherscanLink'
import { ApproveOrPermitState, useSwapApprovalOptimizedTrade, useSwapRouterAddress } from 'hooks/swap/useSwapApproval'
import { usePendingApproval } from 'hooks/transactions'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApprovalTransactionInfo, TransactionType } from 'state/transactions'
import { Colors } from 'theme'
import { ExplorerDataType } from 'utils/getExplorerLink'

export function useIsPendingApproval(token?: Token, spender?: string): boolean {
  return Boolean(usePendingApproval(token, spender))
}

/**
 * An approving ActionButton.
 * Should only be rendered if a valid trade exists that is not yet approved.
 */
export default function ApproveButton({
  color,
  trade,
  approvalState,
  handleApproveOrPermit,
  onSubmit,
}: {
  color: keyof Colors
  trade: ReturnType<typeof useSwapApprovalOptimizedTrade>
  approvalState: ApproveOrPermitState
  handleApproveOrPermit: () => Promise<{
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
      const info = await handleApproveOrPermit()
      if (!info) return

      return { type: TransactionType.APPROVAL, ...info }
    })
    setIsPending(false)
  }, [handleApproveOrPermit, onSubmit])

  const currency = trade?.inputAmount?.currency
  const symbol = currency?.symbol || ''

  // Reset the pending state if currency changes.
  useEffect(() => setIsPending(false), [currency])

  const pendingApprovalHash = usePendingApproval(currency?.isToken ? currency : undefined, useSwapRouterAddress(trade))

  const actionProps = useMemo(() => {
    switch (approvalState) {
      case ApproveOrPermitState.REQUIRES_APPROVAL:
        if (isPending) {
          return { message: <Trans>Approve in your wallet</Trans>, icon: Spinner }
        }
        return {
          message: <Trans>Approve {symbol} first</Trans>,
          onClick: onApprove,
          children: <Trans>Approve</Trans>,
        }
      case ApproveOrPermitState.REQUIRES_SIGNATURE:
        if (isPending) {
          return { message: <Trans>Allow in your wallet</Trans>, icon: Spinner }
        }
        return {
          message: <Trans>Allow {symbol} first</Trans>,
          onClick: onApprove,
          children: <Trans>Allow</Trans>,
        }
      case ApproveOrPermitState.PENDING_APPROVAL:
        return {
          message: (
            <EtherscanLink type={ExplorerDataType.TRANSACTION} data={pendingApprovalHash}>
              <Trans>Approval pending</Trans>
            </EtherscanLink>
          ),
          icon: Spinner,
        }
      case ApproveOrPermitState.PENDING_SIGNATURE:
        return { message: <Trans>Allowance pending</Trans>, icon: Spinner }
      default:
        return
    }
  }, [approvalState, symbol, isPending, onApprove, pendingApprovalHash])

  return <ActionButton color={color} action={actionProps} />
}
