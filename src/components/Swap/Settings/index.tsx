import { useOnEscapeHandler } from 'hooks/useOnEscapeHandler'
import { Settings as SettingsIcon } from 'icons'
import { useState } from 'react'
import styled from 'styled-components/macro'

import { IconButton } from '../../Button'
import Column from '../../Column'
import Popover, { PopoverBoundaryProvider } from '../../Popover'
import MaxSlippageSelect from './MaxSlippageSelect'
import TransactionTtlInput from './TransactionTtlInput'

export function SettingsPopover() {
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null)

  // TODO (WEB-2754): add back reset settings functionality
  return (
    <Column gap={1} style={{ paddingTop: '1em' }} ref={setBoundary} padded>
      <PopoverBoundaryProvider value={boundary}>
        <MaxSlippageSelect />
        <TransactionTtlInput />
      </PopoverBoundaryProvider>
    </Column>
  )
}

const SettingsButton = styled(IconButton)`
  ${SettingsIcon}:hover {
    transform: rotate(45deg);
    transition: transform 0.25s;
  }

  ${SettingsIcon} {
    transform: rotate(0);
    transition: transform 0.25s;
  }
`

export default function Settings() {
  const [open, setOpen] = useState(false)
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  useOnEscapeHandler(() => setOpen(false))

  return (
    <div ref={setWrapper}>
      <PopoverBoundaryProvider value={wrapper}>
        <Popover showArrow={false} offset={10} show={open} placement="top-end" content={<SettingsPopover />}>
          <SettingsButton onClick={() => setOpen(!open)} icon={SettingsIcon} />
        </Popover>
      </PopoverBoundaryProvider>
    </div>
  )
}
