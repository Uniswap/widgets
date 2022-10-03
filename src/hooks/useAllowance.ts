import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useTokenContract } from 'hooks/useContract'
import { useCallback } from 'react'
import { calculateGasMargin } from 'utils/calculateGasMargin'

export function useAllowanceCallback(
  amount: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  allowance: CurrencyAmount<Token> | undefined
): () => Promise<{ response: TransactionResponse; tokenAddress: string; spenderAddress: string } | undefined> {
  const { chainId } = useWeb3React()
  const token = amount?.currency?.isToken ? amount.currency : undefined

  const tokenContract = useTokenContract(token?.address)

  return useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} allowance failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (!chainId || !spender || !token || !tokenContract) return
    if (!amount || !allowance || !amount.greaterThan(allowance)) return

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens which restrict allowance amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amount.quotient.toString())
    })

    return tokenContract
      .approve(spender, useExact ? amount.quotient.toString() : MaxUint256, {
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
  }, [chainId, spender, token, tokenContract, amount, allowance])
}
