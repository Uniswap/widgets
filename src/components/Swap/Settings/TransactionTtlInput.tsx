import { Trans } from '@lingui/macro'
import { IconButton } from 'components/Button'
import Column from 'components/Column'
import Expando, { IconPrefix } from 'components/Expando'
import { inputCss, IntegerInput } from 'components/Input'
import Row from 'components/Row'
import { useDefaultTransactionTtl, useTransactionTtl } from 'hooks/useTransactionDeadline'
import { Expando as ExpandoIcon } from 'icons'
import { useRef, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { WIDGET_BREAKPOINTS } from 'theme/breakpoints'

import { Label } from './components'

const Input = styled(Row)`
  ${inputCss};

  background-color: transparent;
  max-width: ${WIDGET_BREAKPOINTS.EXTRA_SMALL}px;

  input {
    text-align: right;
  }
`

const InputContainer = styled(Row)`
  gap: 0.5rem;
  margin: 1rem 0 0;
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
        maxHeight={4}
        open={open}
        onExpand={() => setOpen(!open)}
        styledWrapper={false}
        title={
          <Row style={{ cursor: 'pointer' }} onClick={() => setOpen((open) => !open)}>
            <Label
              name={<Trans>Transaction deadline</Trans>}
              // TODO (tina): clicking on this tooltip on mobile shouldn't open/close expando
              tooltip={
                <Trans>Your transaction will revert if it has been pending for longer than this period of time.</Trans>
              }
            />
            <Row gap={0.2} justify="flex-end" flex>
              <IconPrefix>
                <TtlValue>{ttlValue ?? placeholder}m</TtlValue>
              </IconPrefix>
              <IconButton color="secondary" icon={ExpandoIcon} iconProps={{ open }} />
            </Row>
          </Row>
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
