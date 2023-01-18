import { Trans } from '@lingui/macro'
import Row from 'components/Row'
import Toggle from 'components/Toggle'
import { RouterPreference } from 'hooks/routing/useRouterTrade'
import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'
import { swapEventHandlersAtom } from 'state/swap'
import { routerAtom } from 'state/swap/settings'
import styled from 'styled-components/macro'

import { Label } from './components'

const StyledRow = styled(Row)`
  color: ${({ theme }) => theme.secondary};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
`
export default function RouterPreferenceToggle() {
  const { onRouterPreferenceChange } = useAtomValue(swapEventHandlersAtom)
  const [routerPreference, setRouterPreferenceBase] = useAtom(routerAtom)
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
    <StyledRow>
      <Label
        name={<Trans>Auto Router API</Trans>}
        // TODO (tina): clicking on this tooltip on mobile shouldn't open/close expando
        tooltip={
          <Trans>Your transaction will revert if the price changes unfavorably by more than this percentage.</Trans>
        }
      />
      <Toggle onToggle={onToggle} checked={routerPreference === RouterPreference.API} />
    </StyledRow>
  )
}
