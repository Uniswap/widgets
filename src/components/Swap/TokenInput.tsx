import 'setimmediate'

import { Currency } from '@uniswap/sdk-core'
import { loadingTransitionCss } from 'css/loading'
import { forwardRef, PropsWithChildren, useCallback, useImperativeHandle, useRef } from 'react'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Column from '../Column'
import { DecimalInput } from '../Input'
import Row from '../Row'
import TokenSelect from '../TokenSelect'

const TokenInputRow = styled(Row)`
  grid-template-columns: 1fr;
`

const ValueInput = styled(DecimalInput)`
  color: ${({ theme }) => theme.primary};
  height: 1.5em;
  margin: -0.25em 0;

  :hover:not(:focus-within) {
    color: ${({ theme }) => theme.onHover(theme.primary)};
  }

  :hover:not(:focus-within)::placeholder {
    color: ${({ theme }) => theme.onHover(theme.secondary)};
  }

  ${loadingTransitionCss}
`

export interface TokenInputHandle {
  focus: () => void
}

interface TokenInputProps {
  amount: string
  currency?: Currency
  disabled?: boolean
  field: Field
  max?: string
  onChangeInput: (input: string) => void
  onChangeCurrency: (currency: Currency) => void
  loading?: boolean
}

export const TokenInput = forwardRef<TokenInputHandle, PropsWithChildren<TokenInputProps>>(function TokenInput(
  { amount, currency, disabled, field, onChangeInput, onChangeCurrency, loading, children },
  ref
) {
  const input = useRef<HTMLInputElement>(null)
  const onSelect = useCallback(
    (currency: Currency) => {
      onChangeCurrency(currency)
      setImmediate(() => input.current?.focus())
    },
    [onChangeCurrency]
  )

  const focus = useCallback(() => {
    setImmediate(() => {
      input.current?.focus()
      // Bring the start of the input into view so its value is apparent to the user.
      // The cursor will remain at the end of the input, and may be hidden.
      input.current?.scrollTo(0, 0)
    })
  }, [])
  useImperativeHandle(ref, () => ({ focus }), [focus])

  return (
    <Column gap={0.25}>
      <TokenInputRow gap={0.5}>
        <ThemedText.H2>
          <ValueInput
            value={amount}
            onChange={onChangeInput}
            disabled={disabled || !currency}
            isLoading={Boolean(loading)}
            ref={input}
          ></ValueInput>
        </ThemedText.H2>
        <TokenSelect value={currency} disabled={disabled} onSelect={onSelect} field={field} />
      </TokenInputRow>
      {children}
    </Column>
  )
})

export default TokenInput
