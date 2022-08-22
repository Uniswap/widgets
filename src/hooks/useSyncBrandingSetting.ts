import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { disableBrandingAtom } from 'state/widget'

export interface BrandingSetting {
  disableBranding?: boolean
}

export default function useSyncBrandingSetting({ disableBranding }: BrandingSetting): void {
  const setDisableBranding = useUpdateAtom(disableBrandingAtom)
  useEffect(() => setDisableBranding(disableBranding ?? false), [disableBranding, setDisableBranding])
}
