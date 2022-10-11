import { useLingui } from '@lingui/react'
import { useIsSwapFieldIndependent, useSwapAmount, useSwapCurrency, useSwapInfo } from 'hooks/swap'
import useCurrencyColor from 'hooks/useCurrencyColor'
import { atom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { DynamicThemeProvider, ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import Row from '../Row'
import { Balance, InputColumn, USDC, useFormattedFieldAmount } from './Input'
import TokenInput from './TokenInput'

export const colorAtom = atom<string | undefined>(undefined)

const StyledInputColumn = styled(InputColumn)`
  border-bottom: 1px solid ${({ theme }) => theme.container};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-bottom: 0;
  padding: 24px 0 20px 0;
`

export default function Output() {
  const { i18n } = useLingui()

  const {
    [Field.OUTPUT]: { balance, amount: outputCurrencyAmount, usdc: outputUSDC },
    error,
    trade: { state: tradeState },
    impact,
  } = useSwapInfo()

  const [swapOutputAmount, updateSwapOutputAmount] = useSwapAmount(Field.OUTPUT)
  const [swapOutputCurrency, updateSwapOutputCurrency] = useSwapCurrency(Field.OUTPUT)

  const isDisabled = error !== undefined
  const isRouteLoading = isDisabled || tradeState === TradeState.LOADING
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
      <StyledInputColumn hasColor={hasColor} gap={0.5}>
        <TokenInput
          amount={amount}
          currency={swapOutputCurrency}
          disabled={isDisabled}
          field={Field.OUTPUT}
          onChangeInput={updateSwapOutputAmount}
          onChangeCurrency={updateSwapOutputCurrency}
          loading={isLoading}
        >
          <ThemedText.Body2 color="secondary" userSelect>
            <Row>
              <USDC gap={0.5} isLoading={isRouteLoading}>
                {outputUSDC && `$${formatCurrencyAmount(outputUSDC, 6, 'en', 2)} `}
                {impact && <ThemedText.Body2 color={impact.warning}>({impact.toString()})</ThemedText.Body2>}
              </USDC>
              {balance && (
                <Balance color="secondary">
                  Balance: <span>{formatCurrencyAmount(balance, 4, i18n.locale)}</span>
                </Balance>
              )}
            </Row>
          </ThemedText.Body2>
        </TokenInput>
      </StyledInputColumn>
    </DynamicThemeProvider>
  )
}
