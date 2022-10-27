import { Atom } from 'jotai'

import { useInitialController } from './swap/useSyncController'
import { useInitialBrandingSettings } from './useSyncBrandingSetting'

export default function useInitialAtomValues(props: any): [Atom<unknown>, unknown][] {
  const brandingSettings = useInitialBrandingSettings(props)

  // TODO: Use a separate AtomProvider within Swap so that its configuration can be separated from general Widget configuration.
  const controller = useInitialController(props)

  return [brandingSettings, controller]
}
