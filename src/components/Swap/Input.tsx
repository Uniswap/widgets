import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { TextButton } from 'components/Button'
import { loadingTransitionCss } from 'css/loading'
import { useIsSwapFieldIndependent, useSwapAmount, useSwapCurrency, useSwapInfo } from 'hooks/swap'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { usePrefetchCurrencyColor } from 'hooks/useCurrencyColor'
import { PriceImpact } from 'hooks/usePriceImpact'
import { MouseEvent, useCallback, useMemo, useRef, useState } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import Column from '../Column'
import Row from '../Row'
import TokenInput, { TokenInputHandle } from './TokenInput'

const USDC = styled(Row)`
  ${loadingTransitionCss};
  gap: 0.25em;
`

const Balance = styled(ThemedText.Body2)`
  transition: color 0.25s ease-in-out;
`

const InputColumn = styled(Column)<{ disableHover?: boolean }>`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => theme.borderRadius - 0.25}em;
  margin-bottom: 4px;
  padding: 20px 0 24px 0;
  position: relative;

  &:before {
    background-size: 100%;
    border: 1px solid ${({ theme }) => theme.module};
    border-radius: inherit;

    box-sizing: border-box;
    content: '';
    height: 100%;

    left: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    transition: 125ms ease border-color;
    width: 100%;
  }

  ${({ theme, disableHover }) =>
    !disableHover &&
    ` &:hover:before {
        border-color: ${theme.interactive};
      }

      &:focus-within:before {
        border-color: ${theme.outline};
      }`}
`

export function useFormattedFieldAmount({
  currencyAmount,
  fieldAmount,
}: {
  currencyAmount?: CurrencyAmount<Currency>
  fieldAmount?: string
}) {
  return useMemo(() => {
    if (fieldAmount !== undefined) {
      return fieldAmount
    }
    if (currencyAmount) {
      return formatCurrencyAmount({ amount: currencyAmount })
    }
    return ''
  }, [currencyAmount, fieldAmount])
}

interface FieldWrapperProps {
  field: Field
  maxAmount?: string
  isSufficientBalance?: boolean
  approved?: boolean
  impact?: PriceImpact
}

export function FieldWrapper({
  field,
  maxAmount,
  isSufficientBalance,
  approved,
  impact,
  className,
}: FieldWrapperProps & { className?: string }) {
  const {
    [field]: { balance, amount: currencyAmount, usdc },
    error,
    trade: { state: tradeState },
  } = useSwapInfo()

  const [amount, updateAmount] = useSwapAmount(field)
  const [currency, updateCurrency] = useSwapCurrency(field)

  const wrapper = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState<TokenInputHandle | null>(null)
  const onClick = useCallback(
    (event: MouseEvent) => {
      if (event.target === wrapper.current) {
        input?.focus()
      }
    },
    [input]
  )

  // extract eagerly in case of reversal
  usePrefetchCurrencyColor(currency)

  const isDisabled = error !== undefined
  const isRouteLoading = isDisabled || tradeState === TradeState.LOADING
  const isDependentField = !useIsSwapFieldIndependent(field)
  const isLoading = isRouteLoading && isDependentField

  const isWrap = useIsWrap()
  const formattedAmount = useMemo(() => {
    if (amount !== undefined) return amount
    if (!currencyAmount) return ''
    return isWrap ? currencyAmount.toExact() : formatCurrencyAmount({ amount: currencyAmount })
  }, [amount, currencyAmount, isWrap])

  const onClickMax = useCallback(() => {
    if (!maxAmount) return
    updateAmount(maxAmount, /* origin= */ 'max')
    input?.focus()
  }, [input, maxAmount, updateAmount])

  return (
    <InputColumn disableHover={isDisabled || !currency} ref={wrapper} onClick={onClick} className={className}>
      <TokenInput
        ref={setInput}
        field={field}
        amount={formattedAmount}
        currency={currency}
        loading={isLoading}
        approved={approved}
        disabled={isDisabled}
        onChangeInput={updateAmount}
        onChangeCurrency={updateCurrency}
      >
        <ThemedText.Body2 color="secondary" userSelect>
          <Row>
            <USDC isLoading={isRouteLoading}>
              {usdc && `${formatCurrencyAmount({ amount: usdc, isUsdPrice: true })}`}
              {impact && (
                <ThemedText.Body2 userSelect={false} color={impact.warning}>
                  ({impact.toString()})
                </ThemedText.Body2>
              )}
            </USDC>
            {balance && (
              <Row gap={0.5}>
                <Balance color={isSufficientBalance === false ? 'error' : 'secondary'}>
                  <Trans>Balance:</Trans> {formatCurrencyAmount({ amount: balance })}
                </Balance>
                {maxAmount && (
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
    </InputColumn>
  )
}

export default function Input() {
  const {
    [Field.INPUT]: { balance, amount: currencyAmount },
    approval: { state: approvalState },
  } = useSwapInfo()

  const isSufficientBalance = useMemo(() => {
    if (!balance || !currencyAmount) return undefined
    return !currencyAmount.greaterThan(balance)
  }, [balance, currencyAmount])

  const maxAmount = useMemo(() => {
    // account for gas needed if using max on native token
    const max = maxAmountSpend(balance)
    if (!max || !balance) return
    if (max.equalTo(0) || balance.lessThan(max)) return
    if (currencyAmount && max.equalTo(currencyAmount)) return
    return max.toExact()
  }, [balance, currencyAmount])

  return (
    <FieldWrapper
      field={Field.INPUT}
      maxAmount={maxAmount}
      isSufficientBalance={isSufficientBalance}
      approved={approvalState === SwapApprovalState.APPROVED}
    />
  )
}
