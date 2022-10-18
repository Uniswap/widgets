import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'
import { L2_CHAIN_IDS } from 'constants/chains'
import { DEFAULT_DEADLINE_FROM_NOW, L2_DEADLINE_FROM_NOW } from 'constants/misc'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { swapEventHandlersAtom } from 'state/swap'
import { transactionTtlAtom } from 'state/swap/settings'

/** Returns the default transaction TTL for the chain, in minutes. */
export function useDefaultTransactionTtl(): number {
  const { chainId } = useWeb3React()
  if (chainId && L2_CHAIN_IDS.includes(chainId)) return L2_DEADLINE_FROM_NOW / 60
  return DEFAULT_DEADLINE_FROM_NOW / 60
}

/** Returns the user-inputted transaction TTL, in minutes. */
export function useTransactionTtl(): [number | undefined, (ttl?: number) => void] {
  const { onTransactionDeadlineChange } = useAtomValue(swapEventHandlersAtom)
  const [ttl, setTtlBase] = useAtom(transactionTtlAtom)
  const setTtl = useCallback(
    (ttl?: number) => {
      onTransactionDeadlineChange?.(ttl)
      setTtlBase(ttl)
    },
    [onTransactionDeadlineChange, setTtlBase]
  )
  return [ttl, setTtl]
}

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const [ttl] = useTransactionTtl()
  const defaultTtl = useDefaultTransactionTtl()

  const blockTimestamp = useCurrentBlockTimestamp()
  return useMemo(() => {
    if (!blockTimestamp) return undefined
    return blockTimestamp.add((ttl || defaultTtl) /* in seconds */ * 60)
  }, [blockTimestamp, defaultTtl, ttl])
}
