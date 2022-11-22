import { Atom, atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useMemo } from 'react'

export interface Flags {
  brandedFooter?: boolean
}

const flagsAtom = atom<Flags>({})

export function useBrandedFooter() {
  return useAtomValue(flagsAtom).brandedFooter ?? true
}

export function useInitialFlags({ brandedFooter }: Flags): [Atom<Flags>, Flags] {
  return [flagsAtom, { brandedFooter }]
}

export default function useSyncFlags({ brandedFooter }: Flags): void {
  const updateFlags = useUpdateAtom(flagsAtom)
  const flags = useMemo(() => ({ brandedFooter }), [brandedFooter])
  updateFlags(flags)
}
