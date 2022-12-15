import { t, Trans } from '@lingui/macro'
import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import ActionButton from 'components/ActionButton'
import EtherscanLink from 'components/EtherscanLink'
import { usePendingApproval } from 'hooks/transactions'
import { Permit, PermitState } from 'hooks/usePermit2'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApprovalTransactionInfo } from 'state/transactions'
import { Colors } from 'theme'
import { ExplorerDataType } from 'utils/getExplorerLink'

interface PermitButtonProps extends Permit {
  color: keyof Colors
  onSubmit: (submit: () => Promise<ApprovalTransactionInfo | void>) => Promise<void>
}

/**
 * An approving PermitButton.
 * Should only be rendered if a valid trade exists that is not yet permitted.
 */
export default function PermitButton({ token, state, callback, color, onSubmit }: PermitButtonProps) {
  const isApprovalLoading = state === PermitState.APPROVAL_LOADING
  const [isPending, setIsPending] = useState(false)
  const [isFailed, setIsFailed] = useState(false)
  const pendingApproval = usePendingApproval(token, PERMIT2_ADDRESS)
  useEffect(() => {
    // Reset pending/failed state if currency changes.
    setIsPending(false)
    setIsFailed(false)
  }, [token])

  const onClick = useCallback(async () => {
    setIsPending(true)
    try {
      await onSubmit(async () => await callback?.())
      setIsFailed(false)
    } catch (e) {
      console.error(e)
      setIsFailed(true)
    } finally {
      setIsPending(false)
    }
  }, [callback, onSubmit])

  const action = useMemo(() => {
    if (isPending) {
      return {
        icon: Spinner,
        message: t`Approve in your wallet`,
      }
    } else if (isApprovalLoading) {
      return {
        icon: Spinner,
        message: pendingApproval ? (
          <EtherscanLink type={ExplorerDataType.TRANSACTION} data={pendingApproval}>
            <Trans>Approval pending</Trans>
          </EtherscanLink>
        ) : (
          <Trans>Approval pending</Trans>
        ),
      }
    } else if (isFailed) {
      return {
        message: t`Approval failed`,
        onClick,
      }
    } else {
      return {
        tooltipContent: t`Permission is required for Uniswap to swap each token. This will expire after one month for your security.`,
        message: t`Approve use of ${token ?? 'token'}`,
        onClick,
      }
    }
  }, [isApprovalLoading, isFailed, isPending, onClick, pendingApproval, token])

  return (
    <ActionButton color={color} disabled={!action?.onClick} action={action}>
      {isFailed ? t`Try again` : t`Approve`}
    </ActionButton>
  )
}
