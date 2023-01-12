import { Contract } from '@ethersproject/contracts'
import { CallState as CallStateBase } from '@uniswap/redux-multicall'
import { useWeb3React } from '@web3-react/core'
import { Interface } from 'ethers/lib/utils'
import useBlockNumber from 'hooks/useBlockNumber'
import multicall from 'state/multicall'

export type { CallStateResult } from '@uniswap/redux-multicall' // re-export for convenience
export { NEVER_RELOAD } from '@uniswap/redux-multicall' // re-export for convenience

// Create wrappers for hooks so consumers don't need to get latest block themselves

interface CallState<C extends Contract, M extends keyof C['functions']> extends Omit<CallStateBase, 'result'> {
  result: C['functions'][M] extends (...args: any) => Promise<infer T> ? T | undefined : never
}

type MultipleContractParams<
  M extends string,
  T extends (
    chainId: number | undefined,
    latestBlock: number | undefined,
    addresses: (string | undefined)[],
    contractInterface: Interface,
    methodName: M,
    ...args: any
  ) => any
> = Parameters<T> extends [any, any, ...infer P] ? P : never

export function useMultipleContractSingleData<C extends Contract, M extends string>(
  ...args: MultipleContractParams<M, typeof multicall.hooks.useMultipleContractSingleData>
) {
  const { chainId, latestBlock } = useCallContext()
  return multicall.hooks.useMultipleContractSingleData(chainId, latestBlock, ...args) as CallState<C, M>[]
}

type SingleContractParams<
  C extends Contract,
  M extends string,
  T extends (
    chainId: number | undefined,
    latestBlock: number | undefined,
    contract: C | null | undefined,
    methodName: M,
    ...args: any
  ) => any
> = Parameters<T> extends [any, any, ...infer P] ? P : never

export function useSingleCallResult<C extends Contract, M extends string>(
  ...args: SingleContractParams<C, M, typeof multicall.hooks.useSingleCallResult>
) {
  const { chainId, latestBlock } = useCallContext()
  return multicall.hooks.useSingleCallResult(chainId, latestBlock, ...args) as CallState<C, M>
}

export function useSingleContractMultipleData<C extends Contract, M extends string>(
  ...args: SingleContractParams<C, M, typeof multicall.hooks.useSingleContractMultipleData>
) {
  const { chainId, latestBlock } = useCallContext()
  return multicall.hooks.useSingleContractMultipleData(chainId, latestBlock, ...args) as CallState<C, M>[]
}

function useCallContext() {
  const { chainId } = useWeb3React()
  const latestBlock = useBlockNumber()
  return { chainId, latestBlock }
}
