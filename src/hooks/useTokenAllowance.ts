import { BigNumberish } from '@ethersproject/bignumber'
import { CurrencyAmount, MaxUint256, Token } from '@uniswap/sdk-core'
import { Erc20 } from 'abis/types'
import { ErrorCode } from 'constants/eip1193'
import { UserRejectedRequestError } from 'errors'
import { useSingleCallResult } from 'hooks/multicall'
import { useTokenContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { swapEventHandlersAtom } from 'state/swap'
import { ApprovalTransactionInfo, TransactionType } from 'state/transactions'
import { calculateGasMargin } from 'utils/calculateGasMargin'

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

  // If there is no allowance yet, re-check next observed block.
  // This guarantees that the tokenAllowance is marked isSyncing upon approval and updated upon being synced.
  const [blocksPerFetch, setBlocksPerFetch] = useState<1>()
  const { result, syncing: isSyncing } = useSingleCallResult(contract, 'allowance', inputs, { blocksPerFetch }) as {
    result: Awaited<ReturnType<Erc20['allowance']>> | undefined
    syncing: boolean
  }

  const rawAmount = result?.toString() // convert to a string before using in a hook, to avoid spurious rerenders
  const allowance = useMemo(
    () => (token && rawAmount ? CurrencyAmount.fromRawAmount(token, rawAmount) : undefined),
    [token, rawAmount]
  )
  useEffect(() => setBlocksPerFetch(allowance?.equalTo(0) ? 1 : undefined), [allowance])

  return useMemo(() => ({ tokenAllowance: allowance, isSyncing }), [allowance, isSyncing])
}

export function useUpdateTokenAllowance(
  amount: CurrencyAmount<Token> | undefined,
  spender: string
): () => Promise<ApprovalTransactionInfo> {
  const contract = useTokenContract(amount?.currency.address)

  const updateTokenAllowance = useCallback(async (): Promise<ApprovalTransactionInfo> => {
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
      if ((e as any)?.code === ErrorCode.USER_REJECTED_REQUEST) {
        throw new UserRejectedRequestError()
      } else {
        throw new Error(`${symbol} token allowance failed: ${(e as any)?.message ?? e}`)
      }
    }
  }, [amount, contract, spender])

  const { onTokenAllowance } = useAtomValue(swapEventHandlersAtom)
  return useCallback(() => {
    const allowance = updateTokenAllowance()
    if (amount && spender) {
      onTokenAllowance?.(amount.currency, spender, allowance)
    }
    return allowance
  }, [amount, onTokenAllowance, spender, updateTokenAllowance])
}
