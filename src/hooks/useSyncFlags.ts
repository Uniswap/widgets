import { Atom, atom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'

// Flags are sticky settings - they cannot be changed without remounting the Widget.
export interface Flags {
  brandedFooter?: boolean
  permit2?: boolean
}

const flagsAtom = atom<Flags>({})

export function useInitialFlags({ brandedFooter, permit2 }: Flags): [[Atom<Flags>, Flags]] {
  // Only grab the initial flags on mount - ignore exhaustive-deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => [[flagsAtom, { brandedFooter, permit2 }]], [])
}

export function useBrandedFooter() {
  return useAtomValue(flagsAtom).brandedFooter ?? true
}

export function usePermit2() {
  return useAtomValue(flagsAtom).permit2 ?? false
}
