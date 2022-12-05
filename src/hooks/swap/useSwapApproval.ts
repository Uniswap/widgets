import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
import { ErrorCode } from 'constants/eip1193'
import { useIsPendingApproval } from 'hooks/transactions'
import { PermitState, SignatureData, usePermit } from 'hooks/usePermit'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { swapEventHandlersAtom } from 'state/swap'

import { ApprovalState, useApproval } from '../useApproval'
export { ApprovalState } from '../useApproval'

export enum SwapApprovalState {
  REQUIRES_APPROVAL,
  PENDING_APPROVAL,
  REQUIRES_SIGNATURE,
  PENDING_SIGNATURE,
  APPROVED,
}

export interface SwapApproval {
  state: SwapApprovalState
  signatureData?: SignatureData
  approve?: () => Promise<void>
}

/**
 * Returns all relevant statuses and callback functions for approvals.
 * Considers both standard approval and ERC20 permit.
 */
export function useSwapApproval(amount?: CurrencyAmount<Currency>): SwapApproval {
  const { chainId } = useWeb3React()
  const deadline = useTransactionDeadline()
  const spender = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined

  // Check EIP-20 approval.
  const [approval, approve] = useApproval(amount, spender, useIsPendingApproval)

  // Check EIP-2162 approval.
  const { state: permitState, signatureData, sign } = usePermit(amount, spender, deadline, null)

  // If permit is supported, sign a permit; if not, submit an approval.
  const { onSwapApprove } = useAtomValue(swapEventHandlersAtom)
  const approveOrSign = useMemo(() => {
    if (approval !== ApprovalState.NOT_APPROVED && permitState !== PermitState.NOT_SIGNED) return
    return async () => {
      try {
        if (permitState === PermitState.NOT_SIGNED && sign) {
          try {
            await sign()
          } catch (error) {
            // Try to approve if signing failed for any reason other than the user rejecting it.
            if (error?.code !== ErrorCode.USER_REJECTED_REQUEST) {
              await approve()
            }
          }
        } else {
          await approve()
        }
      } catch (e) {
        // Swallow approval errors - user rejections do not need to be displayed.
        return
      }
      onSwapApprove?.()
    }
  }, [approval, approve, onSwapApprove, permitState, sign])

  const state = useMemo(() => {
    if (approval === ApprovalState.PENDING) {
      return SwapApprovalState.PENDING_APPROVAL
    } else if (permitState === PermitState.LOADING) {
      return SwapApprovalState.PENDING_SIGNATURE
    } else if (approval !== ApprovalState.NOT_APPROVED || permitState === PermitState.SIGNED) {
      return SwapApprovalState.APPROVED
    } else if (sign) {
      return SwapApprovalState.REQUIRES_SIGNATURE
    } else {
      return SwapApprovalState.REQUIRES_APPROVAL
    }
  }, [approval, permitState, sign])

  return {
    state,
    signatureData,
    approve: approveOrSign,
  }
}
