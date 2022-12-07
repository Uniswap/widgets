import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BLOCK_TIME_L1 } from 'constants/chainInfo'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ApprovalTransactionInfo } from '..'
import useInterval from './useInterval'
import { PermitSignature, usePermitAllowance, useUpdatePermitAllowance } from './usePermitAllowance'
import { useTokenAllowance, useUpdateTokenAllowance } from './useTokenAllowance'

export enum PermitState {
  UNKNOWN,
  PERMIT_NEEDED,
  PERMITTED,
}

export interface Permit {
  state: PermitState
  signature?: PermitSignature
  callback?: () => Promise<ApprovalTransactionInfo | void>
}

export default function usePermit(amount?: CurrencyAmount<Token>, spender?: string): Permit {
  const { account } = useWeb3React()
  const tokenAllowance = useTokenAllowance(amount?.currency, account, PERMIT2_ADDRESS)
  const updateTokenAllowance = useUpdateTokenAllowance(amount, PERMIT2_ADDRESS)

  const permitAllowance = usePermitAllowance(amount?.currency, spender)
  const [permitAllowanceAmount, setPermitAllowanceAmount] = useState(permitAllowance?.amount)
  useEffect(() => setPermitAllowanceAmount(permitAllowance?.amount), [permitAllowance?.amount])

  const [signature, setSignature] = useState<PermitSignature>()
  const updatePermitAllowance = useUpdatePermitAllowance(
    amount?.currency,
    spender,
    permitAllowance?.nonce,
    setSignature
  )

  const updateTokenAndPermitAllowance = useCallback(async () => {
    const info = await updateTokenAllowance()
    await updatePermitAllowance()
    return info
  }, [updatePermitAllowance, updateTokenAllowance])

  // Trigger a re-render if either tokenAllowance or signature expire.
  useInterval(
    () => {
      const now = (Date.now() - BLOCK_TIME_L1) / 1000 // ensure it can still go into this block
      if (signature && signature.sigDeadline < now) {
        setSignature(undefined)
      }
      if (permitAllowance && permitAllowance.expiration < now) {
        setPermitAllowanceAmount(undefined)
      }
    },
    BLOCK_TIME_L1,
    true
  )

  return useMemo(() => {
    if (!amount || !tokenAllowance) {
      return { state: PermitState.UNKNOWN }
    } else if (tokenAllowance.greaterThan(amount) || tokenAllowance.equalTo(amount)) {
      if (permitAllowanceAmount?.gte(amount.quotient.toString())) {
        return { state: PermitState.PERMITTED }
      } else if (signature?.details.token === amount.currency.address && signature?.spender === spender) {
        return { state: PermitState.PERMITTED, signature }
      } else {
        return { state: PermitState.PERMIT_NEEDED, callback: updatePermitAllowance }
      }
    } else {
      return { state: PermitState.PERMIT_NEEDED, callback: updateTokenAndPermitAllowance }
    }
  }, [
    amount,
    permitAllowanceAmount,
    signature,
    spender,
    tokenAllowance,
    updatePermitAllowance,
    updateTokenAndPermitAllowance,
  ])
}
