import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
import { ErrorCode } from 'constants/eip1193'
import { PermitState, SignatureData, useERC20Permit } from 'hooks/useERC20Permit'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useCallback, useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { isExactInput } from 'utils/tradeType'

import { useAllowanceCallback } from '../useAllowance'

export enum ApprovalState {
  REQUIRES_ALLOWANCE,
  PENDING_ALLOWANCE,
  REQUIRES_SIGNATURE,
  PENDING_SIGNATURE,
  APPROVED,
}

export interface Approval {
  state: ApprovalState
  allowance?: CurrencyAmount<Token>
  signatureData?: SignatureData
  gatherPermitSignature?: () => Promise<void>
}

function useAmountToAllow(
  trade: InterfaceTrade | undefined,
  allowedSlippage: Percent
): CurrencyAmount<Token> | undefined {
  return useMemo(() => {
    if (!trade?.inputAmount.currency.isToken) return undefined

    if (isExactInput(trade.tradeType)) return trade.inputAmount
    return trade.maximumAmountIn(allowedSlippage)
  }, [allowedSlippage, trade]) as CurrencyAmount<Token>
}

export function useApproval(
  trade: InterfaceTrade | undefined,
  allowedSlippage: Percent,
  usePendingAllowance: (token?: Token, spender?: string) => string | undefined
): Approval {
  const { chainId } = useWeb3React()
  const amount = useAmountToAllow(trade, allowedSlippage)
  const spender = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined
  const deadline = useTransactionDeadline()

  const allowance = useTokenAllowance(amount?.currency, spender)
  const { state: permitState, signatureData, gatherPermitSignature } = useERC20Permit(amount, spender, deadline)
  const pendingAllowance = usePendingAllowance(amount?.currency, spender)

  const state = useMemo(() => {
    if (pendingAllowance) {
      return ApprovalState.PENDING_ALLOWANCE
    } else if (permitState === PermitState.LOADING) {
      return ApprovalState.PENDING_SIGNATURE
    } else if ((amount && allowance && !allowance.lessThan(amount)) || permitState === PermitState.SIGNED) {
      return ApprovalState.APPROVED
    } else if (gatherPermitSignature) {
      return ApprovalState.REQUIRES_SIGNATURE
    } else {
      return ApprovalState.REQUIRES_ALLOWANCE
    }
  }, [pendingAllowance, permitState, allowance, amount, gatherPermitSignature])
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
  const { chainId } = useWeb3React()
  const amount = useAmountToAllow(trade, allowedSlippage)
  const spender = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined
  const getAllowance = useAllowanceCallback(amount, spender, allowance)
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
