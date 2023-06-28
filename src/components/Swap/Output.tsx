import { t } from '@lingui/macro'
import { useSwapCurrency, useSwapInfo } from 'hooks/swap'
import useCurrencyColor from 'hooks/useCurrencyColor'
import usePresetCurrency from 'hooks/usePresetCurrency'
import { useWidgetToToken } from 'hooks/useSyncWidgetSettings'
import { useIsWideWidget } from 'hooks/useWidgetWidth'
import { atom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { AnimationSpeed, DynamicThemeProvider } from 'theme'

import { FieldWrapper } from './Input'

export const colorAtom = atom<string | undefined>(undefined)

const OutputWrapper = styled(FieldWrapper)<{ hasColor?: boolean | null; isWide: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.container};
  padding: ${({ isWide }) => (isWide ? '1em 0' : '1.5em 0 1em')};
  margin-bottom: 0.75em;

  // Set transitions to reduce color flashes when switching color/token.
  // When color loads, transition the background so that it transitions from the empty or last state, but not _to_ the empty state.
  transition: ${({ hasColor }) => (hasColor ? `background-color ${AnimationSpeed.Medium} ease-out` : undefined)};
  > {
    // When color is loading, delay the color/stroke so that it seems to transition from the last state.
    transition: ${({ hasColor }) =>
      hasColor === null
        ? `color ${AnimationSpeed.Medium} ease-in, stroke ${AnimationSpeed.Medium} ease-in`
        : undefined};
  }
`

export default function Output() {
  const { impact } = useSwapInfo()

  const [currency] = useSwapCurrency(Field.OUTPUT)
  const overrideColor = useAtomValue(colorAtom)
  const dynamicColor = useCurrencyColor(currency)
  const isWideWidget = useIsWideWidget()
  const color = overrideColor || dynamicColor
  // different state true/null/false allow smoother color transition
  const hasColor = currency ? Boolean(color) || null : false

  const toToken = useWidgetToToken()
  const presetCurrency = usePresetCurrency(toToken?.chainId, toToken?.address)

  return (
    <DynamicThemeProvider color={color}>
      <OutputWrapper
        isWide={isWideWidget}
        field={Field.OUTPUT}
        impact={impact}
        hasColor={hasColor}
        subheader={t`To`}
        presetCurrency={presetCurrency}
        showBalance={false}
      />
    </DynamicThemeProvider>
  )
}
