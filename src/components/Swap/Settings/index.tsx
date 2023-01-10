import { Settings as SettingsIcon } from 'icons'
import { useState } from 'react'
import styled from 'styled-components/macro'

import { IconButton } from '../../Button'
import Column from '../../Column'
import Popover, { BoundaryProvider } from '../../Popover'
import MaxSlippageSelect from './MaxSlippageSelect'
import TransactionTtlInput from './TransactionTtlInput'

export function SettingsPopover() {
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null)

  return (
    <Column gap={1} style={{ paddingTop: '1em' }} ref={setBoundary} padded>
      <BoundaryProvider value={boundary}>
        <MaxSlippageSelect />
        <TransactionTtlInput />
      </BoundaryProvider>
    </Column>
  )
}

const SettingsButton = styled(IconButton)`
  ${SettingsIcon}:hover {
    transform: rotate(45deg);
    transition: transform 0.25s;
  }
`

export default function Settings() {
  const [open, setOpen] = useState(false)
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  return (
    <div ref={setWrapper}>
      <BoundaryProvider value={wrapper}>
        <Popover showArrow={false} offset={10} show={open} placement="top-end" content={<SettingsPopover />}>
          <SettingsButton onClick={() => setOpen(!open)} icon={SettingsIcon} />
        </Popover>
      </BoundaryProvider>
    </div>
  )
}
