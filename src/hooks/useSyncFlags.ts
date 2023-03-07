import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { useWeb3React } from '@web3-react/core'
import { Atom, atom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'

// Flags are sticky settings - they cannot be changed without remounting the Widget.
export interface Flags {
  brandedFooter?: boolean
  permit2?: boolean
}

export const flagsAtom = atom<Flags>({})

export function useInitialFlags({ brandedFooter, permit2 }: Flags): [[Atom<Flags>, Flags]] {
  // Only grab the initial flags on mount - ignore exhaustive-deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => [[flagsAtom, { brandedFooter, permit2 }]], [])
}

export function useBrandedFooter() {
  return useAtomValue(flagsAtom).brandedFooter ?? true
}

export function usePermit2() {
  const { chainId } = useWeb3React()
  const permit2 = useAtomValue(flagsAtom).permit2 ?? false
  try {
    // Detect if the Universal Router is not yet deployed to chainId.
    // This is necessary so that we can fallback correctly on chains without a Universal Router deployment.
    // It will be removed once Universal Router is deployed on all supported chains.
    chainId && UNIVERSAL_ROUTER_ADDRESS(chainId)
    return permit2
  } catch {
    return false
  }
}
