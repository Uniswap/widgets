import { Atom } from 'jotai'

import { SwapController, useInitialController } from './swap/useSyncController'
import { Flags, useInitialFlags } from './useSyncFlags'

export default function useInitialAtomValues(props: any): [Atom<unknown>, unknown][] {
  return [
    useInitialFlags(props as Flags),
    // TODO: Use a separate AtomProvider within Swap so that its configuration can be separated from general Widget configuration.
    useInitialController(props as SwapController),
  ]
}
