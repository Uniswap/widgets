import { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import ActionButton from 'components/ActionButton'
import { useAsyncError } from 'components/Error/ErrorBoundary'
import EtherscanLink from 'components/EtherscanLink'
import { SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { usePendingApproval } from 'hooks/transactions'
import useTokenColorExtraction from 'hooks/useTokenColorExtraction'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
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
  approve,
}: {
  trade?: InterfaceTrade
  state: SwapApprovalState
  approve?: () => Promise<{
    response: TransactionResponse
    tokenAddress: string
    spenderAddress: string
  } | void>
}) {
  const [isPending, setIsPending] = useState(false)
  const throwAsync = useAsyncError()
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
      throwAsync(e)
    } finally {
      setIsPending(false)
    }
  }, [approve, onSubmit, throwAsync])

  const currency = trade?.inputAmount?.currency
  const symbol = currency?.symbol || ''

  // Reset the pending state if currency changes.
  useEffect(() => setIsPending(false), [currency])

  const { chainId } = useWeb3React()
  const spender = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined
  const pendingApprovalHash = usePendingApproval(currency?.isToken ? currency : undefined, spender)

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

  return <ActionButton color={useTokenColorExtraction()} action={actionProps} />
}
