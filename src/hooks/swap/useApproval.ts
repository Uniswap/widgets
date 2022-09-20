import { Percent, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
import { ErrorCode } from 'constants/eip1193'
import { PermitState, SignatureData, useERC20PermitFromTrade } from 'hooks/useERC20Permit'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useCallback, useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { isExactInput } from 'utils/tradeType'

import { AllowanceState, useAllowanceCallback, useAllowanceState } from '../useAllowance'

export enum ApprovalState {
  REQUIRES_ALLOWANCE,
  PENDING_ALLOWANCE,
  REQUIRES_SIGNATURE,
  PENDING_SIGNATURE,
  APPROVED,
}

export interface Approval {
  state: ApprovalState
  allowance: AllowanceState
  signatureData?: SignatureData
  gatherPermitSignature?: () => Promise<void>
}

function useSwapSpender() {
  const { chainId } = useWeb3React()
  return chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined
}

function useAmountToAllow(trade: InterfaceTrade | undefined, allowedSlippage: Percent) {
  return useMemo(() => {
    if (!trade) return undefined
    if (isExactInput(trade.tradeType)) return trade.inputAmount
    if (!trade.inputAmount.currency.isToken) return undefined
    return trade.maximumAmountIn(allowedSlippage)
  }, [allowedSlippage, trade])
}

export function useApproval(
  trade: InterfaceTrade | undefined,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): Approval {
  const deadline = useTransactionDeadline()

  // Check allowance on ERC20 contract based on amount.
  const allowance = useAllowanceState(useAmountToAllow(trade, allowedSlippage), useSwapSpender(), useIsPendingApproval)

  // Check permit if token supports it.
  const {
    state: permitState,
    signatureData,
    gatherPermitSignature,
  } = useERC20PermitFromTrade(trade, allowedSlippage, deadline)

  const state = useMemo(() => {
    if (allowance === AllowanceState.PENDING) {
      return ApprovalState.PENDING_ALLOWANCE
    } else if (permitState === PermitState.LOADING) {
      return ApprovalState.PENDING_SIGNATURE
    } else if (allowance !== AllowanceState.NOT_ALLOWED || permitState === PermitState.SIGNED) {
      return ApprovalState.APPROVED
    } else if (gatherPermitSignature) {
      return ApprovalState.REQUIRES_SIGNATURE
    } else {
      return ApprovalState.REQUIRES_ALLOWANCE
    }
  }, [allowance, permitState, gatherPermitSignature])
  return {
    state,
    allowance,
    signatureData,
    gatherPermitSignature: permitState === PermitState.NOT_SIGNED ? gatherPermitSignature : undefined,
  }
}

export function useApprovalCallback(
  trade: InterfaceTrade | undefined,
  allowedSlippage: Percent,
  { allowance, gatherPermitSignature }: Approval
) {
  const getAllowance = useAllowanceCallback(useAmountToAllow(trade, allowedSlippage), useSwapSpender(), allowance)
  return useCallback(async () => {
    try {
      if (gatherPermitSignature) {
        try {
          return await gatherPermitSignature()
        } catch (error) {
          // Try to approve if gatherPermitSignature failed for any reason other than the user rejecting it.
          if (error?.code === ErrorCode.USER_REJECTED_REQUEST) {
            return
          }
        }
      }
      return await getAllowance()
    } catch (e) {
      // Swallow approval errors - user rejections do not need to be displayed.
    }
  }, [gatherPermitSignature, getAllowance])
}
