import { Trans } from '@lingui/macro'
import Row from 'components/Row'
import Toggle from 'components/Toggle'
import { RouterPreference } from 'hooks/routing/types'
import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'
import { swapEventHandlersAtom } from 'state/swap'
import { routerPreferenceAtom } from 'state/swap/settings'
import { ThemedText } from 'theme'

import { Label } from './components'

export default function RouterPreferenceToggle() {
  const { onRouterPreferenceChange } = useAtomValue(swapEventHandlersAtom)
  const [routerPreference, setRouterPreferenceBase] = useAtom(routerPreferenceAtom)
  const setRouterPreference = useCallback(
    (update: RouterPreference) => {
      onRouterPreferenceChange?.(update)
      setRouterPreferenceBase(update)
    },
    [onRouterPreferenceChange, setRouterPreferenceBase]
  )

  const onToggle = () => {
    if (routerPreference === RouterPreference.API) {
      setRouterPreference(RouterPreference.CLIENT)
      return
    }

    setRouterPreference(RouterPreference.API)
  }

  return (
    <Row flex align="center">
      <Label
        name={
          <ThemedText.Subhead2 color="primary">
            <Trans>Auto Router API</Trans>
          </ThemedText.Subhead2>
        }
        tooltip={<Trans>Use the Uniswap Labs API to get faster quotes.</Trans>}
      />
      <Toggle onToggle={onToggle} checked={routerPreference === RouterPreference.API} />
    </Row>
  )
}
