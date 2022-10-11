import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
import { ErrorCode } from 'constants/eip1193'
import { useERC20PermitFromTrade, UseERC20PermitState } from 'hooks/useERC20Permit'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { swapEventHandlersAtom } from 'state/swap'

import { ApprovalState, useApproval } from '../useApproval'
export { ApprovalState } from '../useApproval'

// wraps useApproveCallback in the context of a swap
export default function useSwapApproval(
  trade: InterfaceTrade | undefined,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  amount?: CurrencyAmount<Currency> // defaults to trade.maximumAmountIn(allowedSlippage)
) {
  const { chainId } = useWeb3React()
  const amountToApprove = useMemo(
    () => amount || (trade && trade.inputAmount.currency.isToken ? trade.maximumAmountIn(allowedSlippage) : undefined),
    [amount, trade, allowedSlippage]
  )
  const spender = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined

  const approval = useApproval(amountToApprove, spender, useIsPendingApproval)
  return approval
}

export enum ApproveOrPermitState {
  REQUIRES_APPROVAL,
  PENDING_APPROVAL,
  REQUIRES_SIGNATURE,
  PENDING_SIGNATURE,
  APPROVED,
}

/**
 * Returns all relevant statuses and callback functions for approvals.
 * Considers both standard approval and ERC20 permit.
 */
export const useApproveOrPermit = (
  trade: InterfaceTrade | undefined,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  amount?: CurrencyAmount<Currency> // defaults to trade.maximumAmountIn(allowedSlippage)
) => {
  const deadline = useTransactionDeadline()

  // Check approvals on ERC20 contract based on amount.
  const [approval, getApproval] = useSwapApproval(trade, allowedSlippage, useIsPendingApproval, amount)

  // Check status of permit and whether token supports it.
  const {
    state: signatureState,
    signatureData,
    gatherPermitSignature,
  } = useERC20PermitFromTrade(trade, allowedSlippage, deadline)

  // If permit is supported, trigger a signature, if not create approval transaction.
  const { onSwapApprove } = useAtomValue(swapEventHandlersAtom)
  const handleApproveOrPermit = useCallback(async () => {
    try {
      if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
        try {
          await gatherPermitSignature()
        } catch (error) {
          // Try to approve if gatherPermitSignature failed for any reason other than the user rejecting it.
          if (error?.code !== ErrorCode.USER_REJECTED_REQUEST) {
            await getApproval()
          }
        }
      } else {
        await getApproval()
      }
    } catch (e) {
      // Swallow approval errors - user rejections do not need to be displayed.
      return
    }
    onSwapApprove?.()
  }, [onSwapApprove, signatureState, gatherPermitSignature, getApproval])

  const approvalState = useMemo(() => {
    if (approval === ApprovalState.PENDING) {
      return ApproveOrPermitState.PENDING_APPROVAL
    } else if (signatureState === UseERC20PermitState.LOADING) {
      return ApproveOrPermitState.PENDING_SIGNATURE
    } else if (approval !== ApprovalState.NOT_APPROVED || signatureState === UseERC20PermitState.SIGNED) {
      return ApproveOrPermitState.APPROVED
    } else if (gatherPermitSignature) {
      return ApproveOrPermitState.REQUIRES_SIGNATURE
    } else {
      return ApproveOrPermitState.REQUIRES_APPROVAL
    }
  }, [approval, gatherPermitSignature, signatureState])

  return {
    approvalState,
    signatureData,
    handleApproveOrPermit,
  }
}
