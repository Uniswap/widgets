import { BigNumberish } from '@ethersproject/bignumber'
import { CurrencyAmount, MaxUint256, Token } from '@uniswap/sdk-core'
import { useSingleCallResult } from 'hooks/multicall'
import { useCallback, useMemo } from 'react'
import { ApprovalTransactionInfo, TransactionType } from 'state/transactions'
import { calculateGasMargin } from 'utils/calculateGasMargin'

import { useTokenContract } from './useContract'

export function useTokenAllowance(
  token?: Token,
  owner?: string,
  spender?: string
): {
  tokenAllowance: CurrencyAmount<Token> | undefined
  isSyncing: boolean
} {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const { result, syncing: isSyncing } = useSingleCallResult(contract, 'allowance', inputs)

  return useMemo(() => {
    const tokenAllowance = token && result && CurrencyAmount.fromRawAmount(token, result.toString())
    return { tokenAllowance, isSyncing }
  }, [isSyncing, result, token])
}

export function useUpdateTokenAllowance(amount: CurrencyAmount<Token> | undefined, spender: string) {
  const contract = useTokenContract(amount?.currency.address)

  return useCallback(async (): Promise<ApprovalTransactionInfo> => {
    try {
      if (!amount) throw new Error('missing amount')
      if (!contract) throw new Error('missing contract')
      if (!spender) throw new Error('missing spender')

      let allowance: BigNumberish = MaxUint256.toString()
      const estimatedGas = await contract.estimateGas.approve(spender, allowance).catch(() => {
        // Fallback for tokens which restrict approval amounts:
        allowance = amount.quotient.toString()
        return contract.estimateGas.approve(spender, allowance)
      })

      const gasLimit = calculateGasMargin(estimatedGas)
      const response = await contract.approve(spender, allowance, { gasLimit })
      return {
        type: TransactionType.APPROVAL,
        response,
        tokenAddress: contract.address,
        spenderAddress: spender,
      }
    } catch (e: unknown) {
      const symbol = amount?.currency.symbol ?? 'Token'
      throw new Error(`${symbol} approval failed: ${e instanceof Error ? e.message : e}`)
    }
  }, [amount, contract, spender])
}
