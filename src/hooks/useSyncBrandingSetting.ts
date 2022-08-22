import { atom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

export const disableBrandingAtom = atom<boolean>(false)

export interface BrandingSetting {
  disableBranding?: boolean
}

export default function useSyncBrandingSetting({ disableBranding }: BrandingSetting): void {
  const setDisableBranding = useUpdateAtom(disableBrandingAtom)
  useEffect(() => setDisableBranding(disableBranding ?? false), [disableBranding, setDisableBranding])
}
