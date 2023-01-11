import { t } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import Column from 'components/Column'
import Row from 'components/Row'
import Rule from 'components/Rule'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { feeOptionsAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { Color, ThemedText } from 'theme'
import { currencyId } from 'utils/currencyId'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { isExactInput } from 'utils/tradeType'

import { useTradeExchangeRate } from '../Price'

const Label = styled.span`
  color: ${({ theme }) => theme.secondary};
`
const Value = styled.span<{ color?: Color }>`
  color: ${({ color, theme }) => color && theme[color]};
  white-space: nowrap;
`
const TokenAmount = styled(ThemedText.H1)`
  color: ${({ theme }) => theme.primary};
`

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
  return (
    <Row gap={2} align="flex-start">
      <ThemedText.Body2 userSelect>
        <Label>{label}</Label>
        {/* TODO(cartcrom): WEB-2764 figure out why tooltips don't work on Dialog components  */}
        {/* {tooltipText && <Tooltip placement={'right'}>{tooltipText}</Tooltip>} */}
      </ThemedText.Body2>
      <Column flex align="flex-end">
        <TokenAmount>
          {formatCurrencyAmount({ amount })} {amount.currency.symbol}
        </TokenAmount>
        {usdcAmount && (
          <ThemedText.Body2>
            <Value color="secondary">{formatCurrencyAmount({ amount: usdcAmount, isUsdPrice: true })}</Value>
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
        const parsedFee = formatCurrencyAmount({ amount: fee })
        rows.push([t`${integrator} fee`, `${parsedFee} ${outputCurrency.symbol || currencyId(outputCurrency)}`])
      }
    }

    if (gasUseEstimateUSD) {
      rows.push([t`Network fee`, `~${formatCurrencyAmount({ amount: gasUseEstimateUSD, isUsdPrice: true })}`])
    }

    if (impact) {
      rows.push([t`Price impact`, impact.toString(), impact.warning])
    }

    let estimationMessage = ''
    if (isExactInput(trade.tradeType)) {
      const localizedMinReceived = formatCurrencyAmount({ amount: trade.minimumAmountOut(slippage.allowed) })
      const minReceivedString = `${localizedMinReceived} ${outputCurrency.symbol}`
      estimationMessage =
        t`Output is estimated. You will receive at least ` + minReceivedString + t`or the transaction will revert.`
      rows.push([t`Minimum output after slippage`, minReceivedString])
    } else {
      const localizedMaxSent = formatCurrencyAmount({ amount: trade.maximumAmountIn(slippage.allowed) })
      const maxSentString = `${localizedMaxSent} ${inputCurrency.symbol}`
      estimationMessage =
        t`Output is estimated. You will send at most ` + maxSentString + t`or the transaction will revert.`
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
      <div style={{ margin: '1em 0' }}>
        <Rule />
      </div>

      <Amount label="You pay" amount={inputAmount} usdcAmount={inputUSDC} />
      <Amount label="You receive" amount={outputAmount} usdcAmount={outputUSDC} tooltipText={estimationMessage} />
    </Column>
  )
}
