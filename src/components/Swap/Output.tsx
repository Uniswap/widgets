import { useSwapCurrency, useSwapInfo } from 'hooks/swap'
import useCurrencyColor from 'hooks/useCurrencyColor'
import { atom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { DynamicThemeProvider } from 'theme'

import { FieldWrapper } from './Input'

export const colorAtom = atom<string | undefined>(undefined)

const OutputWrapper = styled(FieldWrapper)<{ hasColor?: boolean | null }>`
  border-bottom: 1px solid ${({ theme }) => theme.container};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-bottom: 0;
  padding: 24px 0 20px 0;

  // Set transitions to reduce color flashes when switching color/token.
  // When color loads, transition the background so that it transitions from the empty or last state, but not _to_ the empty state.
  transition: ${({ hasColor }) => (hasColor ? 'background-color 0.25s ease-out' : undefined)};
  > {
    // When color is loading, delay the color/stroke so that it seems to transition from the last state.
    transition: ${({ hasColor }) => (hasColor === null ? 'color 0.25s ease-in, stroke 0.25s ease-in' : undefined)};
  }
`

export default function Output() {
  const { impact } = useSwapInfo()

  const [currency] = useSwapCurrency(Field.OUTPUT)
  const overrideColor = useAtomValue(colorAtom)
  const dynamicColor = useCurrencyColor(currency)
  const color = overrideColor || dynamicColor
  // different state true/null/false allow smoother color transition
  const hasColor = currency ? Boolean(color) || null : false

  return (
    <DynamicThemeProvider color={color}>
      <OutputWrapper field={Field.OUTPUT} impact={impact} hasColor={hasColor} />
    </DynamicThemeProvider>
  )
}
