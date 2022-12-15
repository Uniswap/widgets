import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { STANDARD_L1_BLOCK_TIME } from 'constants/chainInfo'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ApprovalTransactionInfo } from '..'
import { usePendingApproval } from './transactions'
import useInterval from './useInterval'
import { PermitSignature, usePermitAllowance, useUpdatePermitAllowance } from './usePermitAllowance'
import { useTokenAllowance, useUpdateTokenAllowance } from './useTokenAllowance'

enum SyncState {
  PENDING,
  SYNCING,
  SYNCED,
}

export enum PermitState {
  INVALID,
  LOADING,
  APPROVAL_OR_PERMIT_NEEDED,
  APPROVAL_LOADING,
  APPROVED_AND_PERMITTED,
}

export interface Permit {
  token?: Token
  state: PermitState
  signature?: PermitSignature
  callback?: () => Promise<ApprovalTransactionInfo | void>
}

export default function usePermit(amount?: CurrencyAmount<Token>, spender?: string): Permit {
  const { account } = useWeb3React()
  const token = amount?.currency
  const { tokenAllowance, isSyncing: isApprovalSyncing } = useTokenAllowance(token, account, PERMIT2_ADDRESS)
  const updateTokenAllowance = useUpdateTokenAllowance(amount, PERMIT2_ADDRESS)
  const isAllowed = useMemo(
    () => amount && (tokenAllowance?.greaterThan(amount) || tokenAllowance?.equalTo(amount)),
    [amount, tokenAllowance]
  )

  const permitAllowance = usePermitAllowance(token, spender)
  const [permitAllowanceAmount, setPermitAllowanceAmount] = useState(permitAllowance?.amount)
  useEffect(() => setPermitAllowanceAmount(permitAllowance?.amount), [permitAllowance?.amount])
  const isPermitted = useMemo(
    () => amount && permitAllowanceAmount?.gte(amount.quotient.toString()),
    [amount, permitAllowanceAmount]
  )

  const [signature, setSignature] = useState<PermitSignature>()
  const updatePermitAllowance = useUpdatePermitAllowance(token, spender, permitAllowance?.nonce, setSignature)
  const isSigned = useMemo(
    () => amount && signature?.details.token === token?.address && signature?.spender === spender,
    [amount, signature?.details.token, signature?.spender, spender, token?.address]
  )

  // Trigger a re-render if either tokenAllowance or signature expire.
  useInterval(
    () => {
      // Calculate now such that the signature will still be valid for the next block.
      const now = (Date.now() - STANDARD_L1_BLOCK_TIME) / 1000
      if (signature && signature.sigDeadline < now) {
        setSignature(undefined)
      }
      if (permitAllowance && permitAllowance.expiration < now) {
        setPermitAllowanceAmount(undefined)
      }
    },
    STANDARD_L1_BLOCK_TIME,
    true
  )

  // Permit2 should be marked syncing from the time approval is submitted (pending) until it is
  // synced in tokenAllowance, to avoid re-prompting the user for an already-submitted approval.
  const [syncState, setSyncState] = useState(SyncState.SYNCED)
  const isApprovalLoading = syncState !== SyncState.SYNCED
  const hasPendingApproval = Boolean(usePendingApproval(token, PERMIT2_ADDRESS))
  useEffect(() => {
    if (hasPendingApproval) {
      setSyncState(SyncState.PENDING)
    } else {
      setSyncState((state) => {
        if (state === SyncState.PENDING && isApprovalSyncing) {
          return SyncState.SYNCING
        } else if (state === SyncState.SYNCING && !isApprovalSyncing) {
          return SyncState.SYNCED
        } else {
          return state
        }
      })
    }
  }, [hasPendingApproval, isApprovalSyncing])

  const callback = useCallback(async () => {
    let info: ApprovalTransactionInfo | undefined
    if (!isAllowed && !hasPendingApproval) {
      info = await updateTokenAllowance()
    }
    if (!isPermitted && !isSigned) {
      await updatePermitAllowance()
    }
    return info
  }, [hasPendingApproval, isAllowed, isPermitted, isSigned, updatePermitAllowance, updateTokenAllowance])

  return useMemo(() => {
    if (!token) {
      return { state: PermitState.INVALID }
    } else if (!tokenAllowance || !permitAllowance) {
      return { token, state: PermitState.LOADING }
    } else if (!(isPermitted || isSigned)) {
      return { token, state: PermitState.APPROVAL_OR_PERMIT_NEEDED, callback }
    } else if (!isAllowed) {
      return {
        token,
        state: isApprovalLoading ? PermitState.APPROVAL_LOADING : PermitState.APPROVAL_OR_PERMIT_NEEDED,
        callback,
      }
    } else {
      return { token, state: PermitState.APPROVED_AND_PERMITTED, signature: isPermitted ? undefined : signature }
    }
  }, [callback, isAllowed, isApprovalLoading, isPermitted, isSigned, permitAllowance, signature, token, tokenAllowance])
}
