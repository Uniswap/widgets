import { Trans } from '@lingui/macro'
import Expando from 'components/Expando'
import { useDefaultTransactionTtl, useTransactionTtl } from 'hooks/useTransactionDeadline'
import { useRef, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Column from '../../Column'
import { inputCss, IntegerInput } from '../../Input'
import Row from '../../Row'
import { Label } from './components'

const Input = styled(Row)`
  ${inputCss};

  background-color: transparent;
  max-width: 360px;

  input {
    text-align: right;
  }
`

const InputContainer = styled(Row)`
  gap: 0.5em;
  margin: 1em 0 0;
`

const TtlValue = styled.div`
  // set min width here to prevent entire popover layout from shrinking when
  // user deletes text in ttl input
  min-width: 3rem;
  text-align: right;
`

export default function TransactionTtlInput() {
  const [ttl, setTtl] = useTransactionTtl()
  const defaultTtl = useDefaultTransactionTtl()
  const placeholder = defaultTtl.toString()
  const input = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const ttlValue = ttl?.toString()
  return (
    <Column gap={0.75}>
      <Expando
        hideRulers
        showBottomGradient={false}
        maxHeight={4}
        open={open}
        onExpand={() => setOpen(!open)}
        iconPrefix={<TtlValue>{ttlValue ?? placeholder}m</TtlValue>}
        title={
          <Label
            name={<Trans>Transaction deadline</Trans>}
            // TODO (tina): clicking on this tooltip on mobile shouldn't open/close expando
            tooltip={
              <Trans>Your transaction will revert if it has been pending for longer than this period of time.</Trans>
            }
          />
        }
      >
        <InputContainer flex grow justify="flex-end">
          <Input gap={0.5} pad={0.5} onClick={() => input.current?.focus()} flex grow flow="nowrap">
            <IntegerInput
              placeholder={placeholder}
              value={ttlValue ?? ''}
              onChange={(value) => setTtl(value ? parseFloat(value) : undefined)}
              ref={input}
              maxLength={10}
            />
            <ThemedText.Body2 color="secondary" margin="0 0.5rem 0 0">
              <Trans>minutes</Trans>
            </ThemedText.Body2>
          </Input>
        </InputContainer>
      </Expando>
    </Column>
  )
}
