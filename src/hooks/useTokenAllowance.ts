import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useSingleCallResult } from 'hooks/multicall'
import { useMemo } from 'react'

import { useTokenContract } from './useContract'

export function useTokenAllowance(token?: Token, spender?: string): CurrencyAmount<Token> | undefined {
  const { account } = useWeb3React()
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [account, spender], [account, spender])
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
