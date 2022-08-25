import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

const disableBrandingAtom = atom<boolean>(false)

export function useBrandingSetting() {
  return useAtomValue(disableBrandingAtom)
}

export interface BrandingSettings {
  disableBranding?: boolean
}

export default function useSyncBrandingSetting({ disableBranding }: BrandingSettings): void {
  const setDisableBranding = useUpdateAtom(disableBrandingAtom)
  useEffect(() => setDisableBranding(disableBranding ?? false), [disableBranding, setDisableBranding])
}
