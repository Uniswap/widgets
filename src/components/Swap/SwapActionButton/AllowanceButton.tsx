import { t, Trans } from '@lingui/macro'
import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import ActionButton, { Action } from 'components/ActionButton'
import EtherscanLink from 'components/EtherscanLink'
import { usePendingApproval } from 'hooks/transactions'
import { AllowanceRequired } from 'hooks/usePermit2Allowance'
import useTokenColorExtraction from 'hooks/useTokenColorExtraction'
import { useIsWideWidget } from 'hooks/useWidgetWidth'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExplorerDataType } from 'utils/getExplorerLink'

/**
 * An approving AllowanceButton.
 * Should only be rendered if a valid trade exists that is not yet allowed.
 */
export default function AllowanceButton({ token, isApprovalLoading, approveAndPermit }: AllowanceRequired) {
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
      await approveAndPermit?.()
      setIsFailed(false)
    } catch (e) {
      console.error(e)
      setIsFailed(true)
    } finally {
      setIsPending(false)
    }
  }, [approveAndPermit])

  const isWideWidget = useIsWideWidget()
  const action: Action = useMemo(() => {
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
            <Trans>{token?.symbol ?? 'Token'} approval pending</Trans>
          </EtherscanLink>
        ) : (
          <Trans>{token?.symbol ?? 'Token'} approval pending</Trans>
        ),
      }
    } else if (isFailed) {
      return {
        message: t`${token?.symbol ?? 'Token'} approval failed`,
        onClick,
        color: 'warning',
      }
    } else {
      return {
        tooltipContent: t`Permission is required for the Uniswap smart contract to use each token. This will expire after one month for your security.`,
        message: isWideWidget
          ? t`Approve ${token?.symbol ?? 'token'} for trading`
          : t`Approve ${token?.symbol ?? 'token'}`,
        onClick,
      }
    }
  }, [isApprovalLoading, isFailed, isPending, isWideWidget, onClick, pendingApproval, token?.symbol])

  const defaultButtonColor = useTokenColorExtraction()
  const buttonColor = useMemo(() => (isFailed ? 'warningSoft' : defaultButtonColor), [defaultButtonColor, isFailed])

  return (
    <ActionButton color={buttonColor} disabled={!action?.onClick} action={action} shouldUseDisabledColor={false}>
      {isFailed ? t`Try again` : t`Approve`}
    </ActionButton>
  )
}
