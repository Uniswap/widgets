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
  width: 4em;

  input {
    text-align: right;
  }
`

const InputContainer = styled(Row)`
  display: flex;
  gap: 0.5em;
  justify-content: flex-start;
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
        <InputContainer grow>
          <Input pad={0.5} justify="start" onClick={() => input.current?.focus()}>
            <ThemedText.Body1>
              <IntegerInput
                placeholder={placeholder}
                value={ttlValue ?? ''}
                onChange={(value) => setTtl(value ? parseFloat(value) : undefined)}
                ref={input}
              />
            </ThemedText.Body1>
          </Input>
          <Trans>
            <ThemedText.Body2 color="secondary">minutes</ThemedText.Body2>
          </Trans>
        </InputContainer>
      </Expando>
    </Column>
  )
}
