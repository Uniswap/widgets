import { t } from '@lingui/macro'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import Column from 'components/Column'
import Row from 'components/Row'
import Rule from 'components/Rule'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { useWidgetWidth } from 'hooks/useWidgetWidth'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { feeOptionsAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { Color, ThemedText } from 'theme'
import { WIDGET_BREAKPOINTS } from 'theme/breakpoints'
import { currencyId } from 'utils/currencyId'

import { useTradeExchangeRate } from '../Price'
import { getEstimateMessage } from './Estimate'

const Label = styled.span`
  color: ${({ theme }) => theme.secondary};
  margin-right: 0.5em;
  max-width: 50%;
`
const Value = styled.span<{ color?: Color }>`
  color: ${({ color, theme }) => color && theme[color]};
  text-align: end;
`

const DetailValue = styled(Value)`
  max-width: 45%;
  overflow-wrap: break-word;
`

const RuleWrapper = styled.div`
  margin: 0.75em 0.125em;
`

const MAX_AMOUNT_STR_LENGTH = 9

interface DetailProps {
  label: string
  value: string
  color?: Color
}

function Detail({ label, value, color }: DetailProps) {
  return (
    <ThemedText.Body2 userSelect>
      <Row flex align="flex-start">
        <Label>{label}</Label>
        <DetailValue color={color}>{value}</DetailValue>
      </Row>
    </ThemedText.Body2>
  )
}

interface AmountProps {
  tooltipText?: string
  label: string
  amount: CurrencyAmount<Currency>
  usdcAmount?: CurrencyAmount<Currency>
}

function Amount({ tooltipText, label, amount, usdcAmount }: AmountProps) {
  const width = useWidgetWidth()
  const [amountFontSize, amountLineHeight] =
    width < WIDGET_BREAKPOINTS.MEDIUM
      ? width < WIDGET_BREAKPOINTS.EXTRA_SMALL
        ? ['24px', '30px']
        : ['30px', '36px']
      : ['36px', '44px']

  let formattedAmount = formatCurrencyAmount(amount, NumberType.TokenTx)
  if (formattedAmount.length > MAX_AMOUNT_STR_LENGTH) {
    formattedAmount =
      width < WIDGET_BREAKPOINTS.EXTRA_WIDE
        ? formatCurrencyAmount(amount, NumberType.TokenNonTx)
        : formatCurrencyAmount(amount, NumberType.SwapTradeAmount)
  }

  return (
    <Row flex align="flex-start">
      <ThemedText.Body2 userSelect>
        <Label>{label}</Label>
        {/* TODO(cartcrom): WEB-2764 figure out why tooltips don't work on Dialog components  */}
        {/* {tooltipText && <Tooltip placement={'right'}>{tooltipText}</Tooltip>} */}
      </ThemedText.Body2>
      <Column flex align="flex-end" grow>
        <ThemedText.H1 color="primary" fontSize={amountFontSize} lineHeight={amountLineHeight}>
          {formattedAmount} {amount.currency.symbol}
        </ThemedText.H1>
        {usdcAmount && (
          <ThemedText.Body2>
            <Value color="secondary">{formatCurrencyAmount(usdcAmount, NumberType.FiatTokenPrice)}</Value>
          </ThemedText.Body2>
        )}
      </Column>
    </Row>
  )
}

interface DetailsProps {
  trade: InterfaceTrade
  slippage: Slippage
  gasUseEstimateUSD?: CurrencyAmount<Token>
  inputUSDC?: CurrencyAmount<Currency>
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
}

export default function Details({ trade, slippage, gasUseEstimateUSD, inputUSDC, outputUSDC, impact }: DetailsProps) {
  const { inputAmount, outputAmount } = trade
  const outputCurrency = outputAmount.currency
  const integrator = window.location.hostname
  const feeOptions = useAtomValue(feeOptionsAtom)
  const [exchangeRate] = useTradeExchangeRate(trade)

  const { details, estimateMessage } = useMemo(() => {
    const details: Array<[string, string] | [string, string, Color | undefined]> = []

    details.push([t`Exchange rate`, exchangeRate])

    if (feeOptions) {
      const fee = outputAmount.multiply(feeOptions.fee)
      if (fee.greaterThan(0)) {
        const parsedFee = formatCurrencyAmount(fee, NumberType.FiatGasPrice)
        details.push([t`${integrator} fee`, `${parsedFee} ${outputCurrency.symbol || currencyId(outputCurrency)}`])
      }
    }

    if (gasUseEstimateUSD) {
      details.push([t`Network fee`, `~${formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)}`])
    }

    if (impact) {
      details.push([t`Price impact`, impact.toString(), impact.warning])
    }

    const { estimateMessage, descriptor, value } = getEstimateMessage(trade, slippage)
    details.push([descriptor, value])

    return { details, estimateMessage }
  }, [exchangeRate, feeOptions, gasUseEstimateUSD, impact, integrator, outputAmount, outputCurrency, slippage, trade])

  return (
    <>
      <Column gap={0.75}>
        <Amount label={t`You pay`} amount={inputAmount} usdcAmount={inputUSDC} />
        <Amount label={t`You receive`} amount={outputAmount} usdcAmount={outputUSDC} tooltipText={estimateMessage} />
        <RuleWrapper>
          <Rule />
        </RuleWrapper>
      </Column>
      <Column gap={0.75}>
        {details.map(([label, detail, color]) => (
          <Detail key={label} label={label} value={detail} color={color} />
        ))}
      </Column>
    </>
  )
}
