import { NEVER_RELOAD, useSingleCallResult } from 'hooks/multicall'
import { useEvmAccountAddress } from 'hooks/useSyncWidgetSettings'
import { useMemo } from 'react'

import { useArgentWalletDetectorContract } from './useContract'

export default function useIsArgentWallet(): boolean {
  const account = useEvmAccountAddress()
  const argentWalletDetector = useArgentWalletDetectorContract()
  const inputs = useMemo(() => [account ?? undefined], [account])
  const call = useSingleCallResult(argentWalletDetector, 'isArgentWallet', inputs, NEVER_RELOAD)
  return Boolean(call?.result?.[0])
}
