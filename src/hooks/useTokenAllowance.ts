import { BigNumberish } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { CurrencyAmount, MaxUint256, Token } from '@uniswap/sdk-core'
import { Erc20 } from 'abis/types'
import { UserRejectedRequestError, WidgetError, WidgetPromise } from 'errors'
import { useSingleCallResult } from 'hooks/multicall'
import { useTokenContract } from 'hooks/useContract'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApprovalTransactionInfo, TransactionType } from 'state/transactions'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { isUserRejection } from 'utils/jsonRpcError'

import { usePerfEventHandler } from './usePerfEventHandler'

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

export function useUpdateTokenAllowance(amount: CurrencyAmount<Token> | undefined, spender: string) {
  const contract = useTokenContract(amount?.currency.address)

  const updateTokenAllowance = useCallback(
    () =>
      WidgetPromise.from(
        async () => {
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
          } as ApprovalTransactionInfo
        },
        null,
        (error) => {
          if (isUserRejection(error)) throw new UserRejectedRequestError()

          const symbol = amount?.currency.symbol ?? 'Token'
          throw new WidgetError({
            message: t`${symbol} token allowance failed: ${(error as any)?.message ?? error}`,
            error,
          })
        }
      ),
    [amount, contract, spender]
  )

  const args = useMemo(() => (amount && spender ? { token: amount.currency, spender } : undefined), [amount, spender])
  return usePerfEventHandler('onTokenAllowance', args, updateTokenAllowance)
}
