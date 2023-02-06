import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import EtherscanLink from 'components/EtherscanLink'
import { SwapApproval, SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { usePendingApproval } from 'hooks/transactions'
import useTokenColorExtraction from 'hooks/useTokenColorExtraction'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { WidoTrade } from 'state/routing/types'
import { TransactionType } from 'state/transactions'
import { ExplorerDataType } from 'utils/getExplorerLink'

import useOnSubmit from './useOnSubmit'

/**
 * An approving ActionButton.
 * Should only be rendered if a valid trade exists that is not yet approved.
 */
export default function ApproveButton({
  trade,
  state,
  spender,
  approve,
}: {
  trade?: WidoTrade
} & SwapApproval) {
  const [isPending, setIsPending] = useState(false)
  const onSubmit = useOnSubmit()
  const onApprove = useCallback(async () => {
    setIsPending(true)
    try {
      await onSubmit(async () => {
        const info = await approve?.()
        if (!info) return

        return { type: TransactionType.APPROVAL, ...info }
      })
    } catch (e) {
      console.error(e) // ignore error
    } finally {
      setIsPending(false)
    }
  }, [approve, onSubmit])

  const currency = trade?.inputAmount?.currency
  const symbol = currency?.symbol || ''

  // Reset the pending state if currency changes.
  useEffect(() => setIsPending(false), [currency])

  const pendingApprovalHash = usePendingApproval(currency?.isToken ? currency : undefined, spender)

  const actionProps = useMemo(() => {
    switch (state) {
      case SwapApprovalState.REQUIRES_APPROVAL:
        if (isPending) {
          return { message: <Trans>Approve in your wallet</Trans>, icon: Spinner, hideButton: true }
        }
        return {
          message: <Trans>Approve {symbol} first</Trans>,
          onClick: onApprove,
          children: <Trans>Approve</Trans>,
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
      default:
        return
    }
  }, [isPending, onApprove, pendingApprovalHash, state, symbol])

  return <ActionButton color={useTokenColorExtraction()} action={actionProps} />
}
