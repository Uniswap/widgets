import { ResponsiveDialog } from 'components/ResponsiveDialog'
import Rule from 'components/Rule'
import { useOnEscapeHandler } from 'hooks/useOnEscapeHandler'
import { Settings as SettingsIcon } from 'icons'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { swapRouterUrlAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { AnimationSpeed } from 'theme'

import { IconButton } from '../../Button'
import Column from '../../Column'
import { PopoverBoundaryProvider } from '../../Popover'
import MaxSlippageSelect from './MaxSlippageSelect'
import RouterPreferenceToggle from './RouterPreferenceToggle'
import TransactionTtlInput from './TransactionTtlInput'

const SettingsColumn = styled(Column)`
  margin: 0.5rem 0.25rem;
`

export function SettingsMenu() {
  const [routerUrl] = useAtom(swapRouterUrlAtom)
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null)

  // TODO (WEB-2754): add back reset settings functionality
  return (
    <SettingsColumn gap={1} ref={setBoundary}>
      <PopoverBoundaryProvider value={boundary}>
        {/*
        If consumer doesn't pass in `routerUrl` as a prop, they have no choice but to use the client-side router,
        so don't show them the settings option.
        */}
        {Boolean(routerUrl) && (
          <>
            <RouterPreferenceToggle />
            <Rule />
          </>
        )}
        <MaxSlippageSelect />
        <Rule />
        <TransactionTtlInput />
      </PopoverBoundaryProvider>
    </SettingsColumn>
  )
}

const SettingsButton = styled(IconButton)`
  // Don't rotate back when un-hovering so that clicking (and losing hover due to the modal backdrop) doesn't cause unintentional back-rotation.
  ${SettingsIcon}:hover {
    transform: rotate(45deg);
    transition: transform ${AnimationSpeed.Medium};
  }
`

export default function Settings() {
  const [open, setOpen] = useState(false)

  useOnEscapeHandler(() => setOpen(false))

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
      defaultView="popover"
      anchor={<SettingsButton data-testid="settings-button" onClick={() => setOpen(!open)} icon={SettingsIcon} />}
      mobileBottomSheet={true}
      bottomSheetTitle="Settings"
    >
      <SettingsMenu />
    </ResponsiveDialog>
  )
}
