import { Trans } from '@lingui/macro'
import useScrollbar from 'hooks/useScrollbar'
import { Settings as SettingsIcon } from 'icons'
import { useResetAtom } from 'jotai/utils'
import React, { useState } from 'react'
import { settingsAtom } from 'state/settings'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { IconButton, TextButton } from '../../Button'
import Column from '../../Column'
import Dialog, { Header } from '../../Dialog'
import { BoundaryProvider } from '../../Popover'
import MaxSlippageSelect from './MaxSlippageSelect'
import TransactionTtlInput from './TransactionTtlInput'

export function SettingsDialog() {
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null)
  const scrollbar = useScrollbar(boundary, { padded: true })
  const resetSettings = useResetAtom(settingsAtom)
  return (
    <>
      <Header title={<Trans>Settings</Trans>} ruled>
        <TextButton onClick={resetSettings}>
          <ThemedText.ButtonSmall>
            <Trans>Reset</Trans>
          </ThemedText.ButtonSmall>
        </TextButton>
      </Header>
      <Column gap={1} style={{ paddingTop: '1em' }} ref={setBoundary} padded css={scrollbar}>
        <BoundaryProvider value={boundary}>
          <MaxSlippageSelect />
          <TransactionTtlInput />
        </BoundaryProvider>
      </Column>
    </>
  )
}

const SettingsButton = styled(IconButton)<{ hover: boolean }>`
  ${SettingsIcon} {
    transform: ${({ hover }) => hover && 'rotate(45deg)'};
    transition: ${({ hover }) => hover && 'transform 0.25s'};
    will-change: transform;
  }
`

export default function Settings({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  return (
    <>
      <SettingsButton
        disabled={disabled}
        hover={hover}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        icon={SettingsIcon}
      />
      {open && (
        <Dialog color="module" onClose={() => setOpen(false)}>
          <SettingsDialog />
        </Dialog>
      )}
    </>
  )
}
