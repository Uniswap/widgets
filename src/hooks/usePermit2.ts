import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import ms from 'ms.macro'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ApprovalTransactionInfo } from '..'
import useInterval from './useInterval'
import { PermitSignature, usePermitAllowance, usePermitAllowanceCallback } from './usePermitAllowance'
import { useTokenAllowance, useTokenAllowanceCallback } from './useTokenAllowance'

export enum PermitState {
  UNKNOWN,
  APPROVAL_NEEDED,
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
  const approveToken = useTokenAllowanceCallback(amount, PERMIT2_ADDRESS)

  const allowanceData = usePermitAllowance(amount?.currency, spender)
  const [permitAllowance, setPermitAllowance] = useState(allowanceData?.amount)
  useEffect(() => setPermitAllowance(allowanceData?.amount), [allowanceData?.amount])

  const [signature, setSignature] = useState<PermitSignature>()
  const permitToken = usePermitAllowanceCallback(amount?.currency, spender, allowanceData?.nonce, setSignature)

  const approveAndPermitToken = useCallback(async () => {
    // Queue both transactions. Delay the permit to ensure the approval is prompted for first.
    const info = approveToken()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await permitToken()
    return await info
  }, [approveToken, permitToken])

  // Trigger a re-render if either tokenAllowance or signature expire.
  useInterval(
    () => {
      const now = Date.now() / 1000
      if (signature && signature.sigDeadline < now) {
        setSignature(undefined)
      }
      if (allowanceData && allowanceData.expiration < now) {
        setPermitAllowance(undefined)
      }
    },
    ms`1s`,
    true
  )

  return useMemo(() => {
    if (!amount || !tokenAllowance) {
      return { state: PermitState.UNKNOWN }
    } else if (tokenAllowance.greaterThan(amount) || tokenAllowance.equalTo(amount)) {
      if (permitAllowance?.gte(amount.quotient.toString())) {
        return { state: PermitState.PERMITTED }
      } else if (signature?.details.token === amount.currency.address && signature?.spender === spender) {
        return { state: PermitState.PERMITTED, signature }
      } else {
        return { state: PermitState.PERMIT_NEEDED, callback: permitToken }
      }
    } else {
      return { state: PermitState.APPROVAL_NEEDED, callback: approveAndPermitToken }
    }
  }, [amount, approveAndPermitToken, permitAllowance, permitToken, signature, spender, tokenAllowance])
}
