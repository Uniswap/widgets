import { Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { TextButton } from 'components/Button'
import { loadingTransitionCss } from 'css/loading'
import {
  useIsSwapFieldIndependent,
  useSwapAmount,
  useSwapCurrency,
  useSwapCurrencyAmount,
  useSwapInfo,
} from 'hooks/swap'
import { usePrefetchCurrencyColor } from 'hooks/useCurrencyColor'
import { useCallback, useMemo, useState } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import invariant from 'tiny-invariant'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import Column from '../Column'
import Row from '../Row'
import TokenImg from '../TokenImg'
import TokenInput, { TokenInputHandle } from './TokenInput'

export const USDC = styled(Row)`
  ${loadingTransitionCss};
`

export const Balance = styled(ThemedText.Body2)`
  transition: color 0.25s ease-in-out;
`

const InputColumn = styled(Column)<{ approved?: boolean }>`
  margin: 0.75em;
  position: relative;

  ${TokenImg} {
    filter: ${({ approved }) => (approved ? undefined : 'saturate(0) opacity(0.4)')};
    transition: filter 0.25s;
  }
`

export interface InputProps {
  disabled: boolean
}

interface UseFormattedFieldAmountArguments {
  currencyAmount?: CurrencyAmount<Currency>
  fieldAmount?: string
}

export function useFormattedFieldAmount({ currencyAmount, fieldAmount }: UseFormattedFieldAmountArguments) {
  return useMemo(() => {
    if (fieldAmount !== undefined) {
      return fieldAmount
    }
    if (currencyAmount) {
      return currencyAmount.toSignificant(6)
    }
    return ''
  }, [currencyAmount, fieldAmount])
}

export default function Input({ disabled }: InputProps) {
  const { i18n } = useLingui()
  const {
    [Field.INPUT]: { balance, amount: tradeCurrencyAmount, usdc },
    trade: { state: tradeState },
  } = useSwapInfo()

  const [inputAmount, updateInputAmount] = useSwapAmount(Field.INPUT)
  const [inputCurrency, updateInputCurrency] = useSwapCurrency(Field.INPUT)
  const inputCurrencyAmount = useSwapCurrencyAmount(Field.INPUT)
  const [input, setInput] = useState<TokenInputHandle | null>(null)

  // extract eagerly in case of reversal
  usePrefetchCurrencyColor(inputCurrency)

  const isRouteLoading = disabled || tradeState === TradeState.LOADING
  const isDependentField = !useIsSwapFieldIndependent(Field.INPUT)
  const isLoading = isRouteLoading && isDependentField

  const amount = useFormattedFieldAmount({
    currencyAmount: tradeCurrencyAmount,
    fieldAmount: inputAmount,
  })

  //TODO(ianlapham): mimic logic from app swap page
  const mockApproved = true

  const insufficientBalance = useMemo(
    () =>
      balance &&
      (inputCurrencyAmount ? inputCurrencyAmount.greaterThan(balance) : tradeCurrencyAmount?.greaterThan(balance)),
    [balance, inputCurrencyAmount, tradeCurrencyAmount]
  )

  const max = useMemo(() => {
    // account for gas needed if using max on native token
    const max = maxAmountSpend(balance)
    if (!max || !balance) return
    if (max.equalTo(0) || balance.lessThan(max)) return
    if (inputCurrencyAmount && max.equalTo(inputCurrencyAmount)) return
    return max.toExact()
  }, [balance, inputCurrencyAmount])
  const onClickMax = useCallback(() => {
    invariant(max)
    updateInputAmount(max)
    input?.focus()
  }, [input, max, updateInputAmount])

  return (
    <InputColumn gap={0.5} approved={mockApproved}>
      <TokenInput
        ref={setInput}
        amount={amount}
        currency={inputCurrency}
        disabled={disabled}
        field={Field.INPUT}
        onChangeInput={updateInputAmount}
        onChangeCurrency={updateInputCurrency}
        loading={isLoading}
      >
        <ThemedText.Body2 color="secondary" userSelect>
          <Row>
            <USDC isLoading={isRouteLoading}>{usdc ? `$${formatCurrencyAmount(usdc, 6, 'en', 2)}` : ''}</USDC>
            {balance && (
              <Row gap={0.5}>
                <Balance color={insufficientBalance ? 'error' : 'secondary'}>
                  <Trans>Balance:</Trans> <span>{formatCurrencyAmount(balance, 4, i18n.locale)}</span>
                </Balance>
                {max && (
                  <TextButton onClick={onClickMax}>
                    <ThemedText.ButtonSmall>
                      <Trans>Max</Trans>
                    </ThemedText.ButtonSmall>
                  </TextButton>
                )}
              </Row>
            )}
          </Row>
        </ThemedText.Body2>
      </TokenInput>
      <Row />
    </InputColumn>
  )
}
