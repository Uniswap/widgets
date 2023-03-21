import { useIsPendingApproval } from 'hooks/transactions'
import { useAtomValue } from 'jotai/utils'
import { useEffect, useMemo, useState } from 'react'
import { WidoTrade } from 'state/routing/types'
import { swapEventHandlersAtom } from 'state/swap'
import { ChainId, getWidoSpender, ZERO_ADDRESS } from 'wido'

import { ApprovalState, useApproval } from '../useApproval'
export { ApprovalState } from '../useApproval'

export enum SwapApprovalState {
  REQUIRES_APPROVAL,
  PENDING_APPROVAL,
  APPROVED,
}

export interface SwapApproval {
  state: SwapApprovalState
  spender?: string
  approve?: () => Promise<any>
}

/**
 * Returns all relevant statuses and callback functions for approvals.
 */
export function useSwapApproval(trade?: WidoTrade): SwapApproval {
  const [spender, setSpender] = useState<string | undefined>()

  useEffect(() => {
    if (!trade || trade.fromToken.isNative) return

    getWidoSpender({
      chainId: trade.fromToken.chainId as ChainId,
      fromToken: trade.fromToken.address,
      toToken: trade.toToken.isNative ? ZERO_ADDRESS : trade.toToken.address,
    }).then(setSpender)
  }, [trade, setSpender])

  const [approval, approve] = useApproval(
    trade?.fromToken.chainId ?? 1,
    trade?.inputAmount,
    spender,
    useIsPendingApproval
  )

  const { onSwapApprove } = useAtomValue(swapEventHandlersAtom)
  const approveHandler = useMemo(() => {
    if (approval !== ApprovalState.NOT_APPROVED) return
    return async () => {
      try {
        const result = await approve()
        onSwapApprove?.()
        return result
      } catch (e) {
        // Swallow approval errors - user rejections do not need to be displayed.
        return
      }
    }
  }, [approval, approve, onSwapApprove])

  const state = useMemo(() => {
    if (approval === ApprovalState.PENDING) {
      return SwapApprovalState.PENDING_APPROVAL
    } else if (approval !== ApprovalState.NOT_APPROVED) {
      return SwapApprovalState.APPROVED
    } else {
      return SwapApprovalState.REQUIRES_APPROVAL
    }
  }, [approval])

  return {
    state,
    spender,
    approve: approveHandler,
  }
}
