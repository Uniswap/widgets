import { atom } from 'jotai'
import { useAtomValue } from 'jotai/utils'

const brandedFooterAtom = atom<boolean>(false)

export function useBrandedFooter() {
  return useAtomValue(brandedFooterAtom)
}

export function useInitialBrandedFooter(brandedFooter?: boolean): [typeof brandedFooterAtom, boolean] {
  return [brandedFooterAtom, brandedFooter ?? true]
}
