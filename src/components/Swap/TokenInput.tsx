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

  ${loadingTransitionCss}
`

const TokenInputColumn = styled(Column)`
  margin: 0.25rem 1rem 0;
`

export interface TokenInputHandle {
  focus: () => void
}

interface TokenInputProps {
  field: Field
  amount: string
  currency?: Currency
  approved?: boolean
  loading?: boolean
  disabled?: boolean
  onChangeInput: (input: string) => void
  onChangeCurrency: (currency: Currency) => void
}

export const TokenInput = forwardRef<TokenInputHandle, PropsWithChildren<TokenInputProps>>(function TokenInput(
  { field, amount, currency, approved, loading, disabled, onChangeInput, onChangeCurrency, children, ...rest },
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
    <TokenInputColumn gap={0.25} {...rest}>
      <TokenInputRow gap={0.5}>
        <ThemedText.H1>
          <ValueInput
            value={amount}
            onChange={onChangeInput}
            disabled={disabled || !currency}
            isLoading={Boolean(loading)}
            ref={input}
          />
        </ThemedText.H1>
        <TokenSelect field={field} value={currency} approved={approved} disabled={disabled} onSelect={onSelect} />
      </TokenInputRow>
      {children}
    </TokenInputColumn>
  )
})

export default TokenInput
