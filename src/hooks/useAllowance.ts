import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useTokenContract } from 'hooks/useContract'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { useCallback, useMemo } from 'react'
import { calculateGasMargin } from 'utils/calculateGasMargin'

export enum AllowanceState {
  UNKNOWN,
  NOT_ALLOWED,
  PENDING,
  ALLOWED,
}

export function useAllowanceState(
  amountToAllow: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingAllowance: (token?: Token, spender?: string) => boolean
): AllowanceState {
  const { account } = useWeb3React()
  const token = amountToAllow?.currency?.isToken ? amountToAllow.currency : undefined

  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingAllowance = useIsPendingAllowance(token, spender)

  return useMemo(() => {
    if (!amountToAllow || !spender) return AllowanceState.UNKNOWN
    if (amountToAllow.currency.isNative) return AllowanceState.ALLOWED
    // we might not have enough data to know whether or not we need to allow
    if (!currentAllowance) return AllowanceState.UNKNOWN

    // amountToAllow will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToAllow)
      ? pendingAllowance
        ? AllowanceState.PENDING
        : AllowanceState.NOT_ALLOWED
      : AllowanceState.ALLOWED
  }, [amountToAllow, currentAllowance, pendingAllowance, spender])
}

export function useAllowanceCallback(
  amountToAllow: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  allowanceState: AllowanceState
): () => Promise<{ response: TransactionResponse; tokenAddress: string; spenderAddress: string } | undefined> {
  const { chainId } = useWeb3React()
  const token = amountToAllow?.currency?.isToken ? amountToAllow.currency : undefined

  const tokenContract = useTokenContract(token?.address)

  return useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} allowance failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (allowanceState !== AllowanceState.NOT_ALLOWED) {
      return logFailure('approve was called unnecessarily')
    } else if (!chainId) {
      return logFailure('no chainId')
    } else if (!token) {
      return logFailure('no token')
    } else if (!tokenContract) {
      return logFailure('tokenContract is null')
    } else if (!amountToAllow) {
      return logFailure('missing amount to approve')
    } else if (!spender) {
      return logFailure('no spender')
    }

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens which restrict allowance amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToAllow.quotient.toString())
    })

    return tokenContract
      .approve(spender, useExact ? amountToAllow.quotient.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
      .then((response) => ({
        response,
        tokenAddress: token.address,
        spenderAddress: spender,
      }))
      .catch((error: Error) => {
        logFailure(error)
        throw error
      })
  }, [allowanceState, token, tokenContract, amountToAllow, spender, chainId])
}
