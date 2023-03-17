import { t, Trans } from '@lingui/macro'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { TextButton } from 'components/Button'
import { loadingTransitionCss } from 'css/loading'
import { useIsSwapFieldIndependent, useSwapAmount, useSwapCurrency, useSwapInfo } from 'hooks/swap'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { usePrefetchCurrencyColor } from 'hooks/useCurrencyColor'
import { PriceImpact } from 'hooks/usePriceImpact'
import { useIsWideWidget } from 'hooks/useWidgetWidth'
import { MouseEvent, useCallback, useMemo, useRef, useState } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { AnimationSpeed, ThemedText } from 'theme'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import Column from '../Column'
import Row from '../Row'
import { PriceImpactRow } from './PriceImpactRow'
import TokenInput, { TokenInputHandle } from './TokenInput'

const USDC = styled(Row)`
  ${loadingTransitionCss};
  gap: 0.25rem;
`

const Balance = styled(ThemedText.Body2)`
  transition: color ${AnimationSpeed.Medium} ease-in-out;
`

const InputColumn = styled(Column)<{ disableHover?: boolean; isWide: boolean }>`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  margin-bottom: 0.25rem;
  padding: ${({ isWide }) => (isWide ? '1rem 0' : '1rem 0 1.5rem')};
  position: relative;

  &:before {
    background-size: 100%;
    border: 1px solid transparent;
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
        border-color: ${theme.networkDefaultShadow};
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
      return formatCurrencyAmount(currencyAmount, NumberType.SwapTradeAmount)
    }
    return ''
  }, [currencyAmount, fieldAmount])
}

interface FieldWrapperProps {
  field: Field
  maxAmount?: string
  approved?: boolean
  fiatValueChange?: PriceImpact
  subheader: string
}

export function FieldWrapper({
  field,
  maxAmount,
  approved,
  fiatValueChange,
  className,
  subheader,
}: FieldWrapperProps & { className?: string }) {
  const {
    [field]: { balance, amount: currencyAmount, usdc },
    error,
    trade: { state: tradeState },
  } = useSwapInfo()

  const [amount, updateAmount] = useSwapAmount(field)
  const [currency, updateCurrency] = useSwapCurrency(field)
  const isWideWidget = useIsWideWidget()

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
    return isWrap ? currencyAmount.toExact() : formatCurrencyAmount(currencyAmount, NumberType.SwapTradeAmount)
  }, [amount, currencyAmount, isWrap])

  const onClickMax = useCallback(() => {
    if (!maxAmount) return
    updateAmount(maxAmount, /* origin= */ 'max')
  }, [maxAmount, updateAmount])

  return (
    <InputColumn
      isWide={isWideWidget}
      disableHover={isDisabled || !currency}
      ref={wrapper}
      onClick={onClick}
      className={className}
    >
      <Row pad={1 /* rem */}>
        <ThemedText.Subhead2 color={'secondary'}>{subheader}</ThemedText.Subhead2>
      </Row>
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
              {usdc && `${formatCurrencyAmount(usdc, NumberType.FiatTokenQuantity)}`}
              <PriceImpactRow
                impact={fiatValueChange}
                tooltipText={t`The estimated difference between the USD values of input and output amounts.`}
              />
            </USDC>
            {balance && (
              <Row gap={0.5}>
                <Balance color="secondary">
                  <Trans>Balance:</Trans> {formatCurrencyAmount(balance)}
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
      approved={approvalState === SwapApprovalState.APPROVED}
      subheader={t`You pay`}
    />
  )
}
