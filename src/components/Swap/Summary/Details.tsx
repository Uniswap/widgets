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
import { Text } from 'rebass'
import { InterfaceTrade } from 'state/routing/types'
import { feeOptionsAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { Color, ThemedText } from 'theme'
import { currencyId } from 'utils/currencyId'
import { isExactInput } from 'utils/tradeType'

import { useTradeExchangeRate } from '../Price'

const Label = styled.span`
  color: ${({ theme }) => theme.secondary};
  margin-right: 0.25em;
`
const Value = styled.span<{ color?: Color }>`
  color: ${({ color, theme }) => color && theme[color]};
  white-space: nowrap;
`
const TokenAmount = styled(Text)<{ widgetWidth: number }>`
  color: ${({ theme }) => theme.primary};
  font-size: ${({ widgetWidth }) => (widgetWidth < 400 ? (widgetWidth < 350 ? '24px' : '30px') : '36px')};
  font-weight: 500;
  line-height: ${({ widgetWidth }) => (widgetWidth < 400 ? (widgetWidth < 350 ? '30px' : '36px') : '44px')};
  white-space: nowrap;
`

function Divider() {
  return (
    <div style={{ margin: '1em 0.125em' }}>
      <Rule />
    </div>
  )
}

interface DetailProps {
  label: string
  value: string
  color?: Color
}

function Detail({ label, value, color }: DetailProps) {
  return (
    <ThemedText.Body2 userSelect>
      <Row gap={2}>
        <Label>{label}</Label>
        <Value color={color}>{value}</Value>
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

  let formattedAmount = formatCurrencyAmount(amount, NumberType.TokenTx)
  if (formattedAmount.length > 9) {
    formattedAmount =
      width >= 420
        ? formatCurrencyAmount(amount, NumberType.SwapTradeAmount)
        : formatCurrencyAmount(amount, NumberType.TokenNonTx)
  }

  return (
    <Row flex align="space-between">
      <ThemedText.Body2 userSelect>
        <Label>{label}</Label>
        {/* TODO(cartcrom): WEB-2764 figure out why tooltips don't work on Dialog components  */}
        {/* {tooltipText && <Tooltip placement={'right'}>{tooltipText}</Tooltip>} */}
      </ThemedText.Body2>
      <Column flex align="flex-end" grow>
        <TokenAmount widgetWidth={width}>
          {formattedAmount} {amount.currency.symbol}
        </TokenAmount>
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
  const inputCurrency = inputAmount.currency
  const outputCurrency = outputAmount.currency
  const integrator = window.location.hostname
  const feeOptions = useAtomValue(feeOptionsAtom)
  const [exchangeRate] = useTradeExchangeRate({ trade })

  const [details, estimationMessage] = useMemo(() => {
    const rows: Array<[string, string] | [string, string, Color | undefined]> = []
    // @TODO(ianlapham): Check that provider fee is even a valid list item

    rows.push([t`Exchange rate`, exchangeRate])

    if (feeOptions) {
      const fee = outputAmount.multiply(feeOptions.fee)
      if (fee.greaterThan(0)) {
        const parsedFee = formatCurrencyAmount(fee, NumberType.FiatGasPrice)
        rows.push([t`${integrator} fee`, `${parsedFee} ${outputCurrency.symbol || currencyId(outputCurrency)}`])
      }
    }

    if (gasUseEstimateUSD) {
      rows.push([t`Network fee`, `~${formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)}`])
    }

    if (impact) {
      rows.push([t`Price impact`, impact.toString(), impact.warning])
    }

    let estimationMessage = ''
    if (isExactInput(trade.tradeType)) {
      const localizedMinReceived = formatCurrencyAmount(trade.minimumAmountOut(slippage.allowed), NumberType.TokenTx)
      const minReceivedString = `${localizedMinReceived} ${outputCurrency.symbol}`
      estimationMessage = t`Output is estimated. You will receive at least ${minReceivedString} or the transaction will revert.`
      rows.push([t`Minimum output after slippage`, minReceivedString])
    } else {
      const localizedMaxSent = formatCurrencyAmount(trade.maximumAmountIn(slippage.allowed), NumberType.TokenTx)
      const maxSentString = `${localizedMaxSent} ${inputCurrency.symbol}`
      estimationMessage = t`Output is estimated. You will send at most ${maxSentString} or the transaction will revert.`
      rows.push([t`Maximum sent`, maxSentString])
    }

    return [rows, estimationMessage]
  }, [
    exchangeRate,
    feeOptions,
    gasUseEstimateUSD,
    impact,
    inputCurrency.symbol,
    integrator,
    outputAmount,
    outputCurrency,
    slippage.allowed,
    trade,
  ])

  return (
    <Column gap={0.5}>
      {details.map(([label, detail, color]) => (
        <Detail key={label} label={label} value={detail} color={color} />
      ))}
      <Divider />

      <Amount label="You pay" amount={inputAmount} usdcAmount={inputUSDC} />
      <Amount label="You receive" amount={outputAmount} usdcAmount={outputUSDC} tooltipText={estimationMessage} />
    </Column>
  )
}
