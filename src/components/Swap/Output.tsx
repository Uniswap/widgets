import { Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import BrandedFooter from 'components/BrandedFooter'
import Rule from 'components/Rule'
import { useIsSwapFieldIndependent, useSwapAmount, useSwapCurrency, useSwapInfo } from 'hooks/swap'
import useCurrencyColor from 'hooks/useCurrencyColor'
import { useBrandingSetting } from 'hooks/useSyncBrandingSetting'
import { atom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { PropsWithChildren } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { DynamicThemeProvider, ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { formatPercentage } from 'utils/formatPercentage'

import Column from '../Column'
import Row from '../Row'
import { Balance, InputProps, USDC, useFormattedFieldAmount } from './Input'
import TokenInput from './TokenInput'

export const colorAtom = atom<string | undefined>(undefined)

const OutputColumn = styled(Column)<{ hasColor: boolean | null }>`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => theme.borderRadius - 0.25}em;
  padding: 0.75em;
  padding-bottom: 0.5em;
  position: relative;

  // Set transitions to reduce color flashes when switching color/token.
  // When color loads, transition the background so that it transitions from the empty or last state, but not _to_ the empty state.
  transition: ${({ hasColor }) => (hasColor ? 'background-color 0.25s ease-out' : undefined)};
  > {
    // When color is loading, delay the color/stroke so that it seems to transition from the last state.
    transition: ${({ hasColor }) => (hasColor === null ? 'color 0.25s ease-in, stroke 0.25s ease-in' : undefined)};
  }
`

const Footer = styled(Row)`
  height: 1em;
`

export default function Output({ disabled, focused, children }: PropsWithChildren<InputProps>) {
  const { i18n } = useLingui()

  const disableBranding = useBrandingSetting()

  const {
    [Field.OUTPUT]: { balance, amount: outputCurrencyAmount, usdc: outputUSDC },
    trade: { state: tradeState },
    impact,
  } = useSwapInfo()

  const [swapOutputAmount, updateSwapOutputAmount] = useSwapAmount(Field.OUTPUT)
  const [swapOutputCurrency, updateSwapOutputCurrency] = useSwapCurrency(Field.OUTPUT)

  const isRouteLoading = disabled || tradeState === TradeState.SYNCING || tradeState === TradeState.LOADING
  const isDependentField = !useIsSwapFieldIndependent(Field.OUTPUT)
  const isLoading = isRouteLoading && isDependentField

  const overrideColor = useAtomValue(colorAtom)
  const dynamicColor = useCurrencyColor(swapOutputCurrency)
  const color = overrideColor || dynamicColor

  // different state true/null/false allow smoother color transition
  const hasColor = swapOutputCurrency ? Boolean(color) || null : false

  const amount = useFormattedFieldAmount({
    currencyAmount: outputCurrencyAmount,
    fieldAmount: swapOutputAmount,
  })

  return (
    <DynamicThemeProvider color={color}>
      <OutputColumn hasColor={hasColor} gap={0.5}>
        <Row>
          <ThemedText.Subhead1 color="secondary">
            <Trans>For</Trans>
          </ThemedText.Subhead1>
        </Row>
        <TokenInput
          amount={amount}
          currency={swapOutputCurrency}
          disabled={disabled}
          field={Field.OUTPUT}
          onChangeInput={updateSwapOutputAmount}
          onChangeCurrency={updateSwapOutputCurrency}
          loading={isLoading}
        >
          <ThemedText.Body2 color="secondary" userSelect>
            <Row>
              <USDC gap={0.5} isLoading={isRouteLoading}>
                {outputUSDC && `$${formatCurrencyAmount(outputUSDC, 6, 'en', 2)} `}
                {impact && (
                  <ThemedText.Body2 color={impact.warning}>({formatPercentage(impact.percent)})</ThemedText.Body2>
                )}
              </USDC>
              {balance && (
                <Balance color={focused ? 'secondary' : 'hint'}>
                  Balance: <span>{formatCurrencyAmount(balance, 4, i18n.locale)}</span>
                </Balance>
              )}
            </Row>
          </ThemedText.Body2>
        </TokenInput>
        <Rule />
        {children}
        {disableBranding ? <Footer /> : <BrandedFooter />}
      </OutputColumn>
    </DynamicThemeProvider>
  )
}
