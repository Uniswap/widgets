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
  label: string
  amount: CurrencyAmount<Currency>
  fiatValue: string
}

function Amount({ label, amount, fiatValue }: AmountProps) {
  return (
    <Row gap={2} align="flex-start">
      <ThemedText.Body2 userSelect>
        <Label>{label}</Label>
      </ThemedText.Body2>
      <Column flex align="flex-end">
        <TokenAmount>
          {formatCurrencyAmount({ amount })} {amount.currency.symbol}
        </TokenAmount>
        <ThemedText.Body2>
          <Value color="secondary">{fiatValue}</Value>
        </ThemedText.Body2>
      </Column>
    </Row>
  )
}

interface DetailsProps {
  trade: InterfaceTrade
  slippage: Slippage
  gasUseEstimateUSD?: CurrencyAmount<Token>
  impact?: PriceImpact
}

export default function Details({ trade, slippage, gasUseEstimateUSD, impact }: DetailsProps) {
  const { inputAmount, outputAmount } = trade
  const inputCurrency = inputAmount.currency
  const outputCurrency = outputAmount.currency
  const integrator = window.location.hostname
  const feeOptions = useAtomValue(feeOptionsAtom)
  const [exchangeRate] = useTradeExchangeRate({ trade })

  const details = useMemo(() => {
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

    if (isExactInput(trade.tradeType)) {
      const localizedMaxSent = formatCurrencyAmount({ amount: trade.minimumAmountOut(slippage.allowed) })
      rows.push([t`Minimum output after slippage`, `${localizedMaxSent} ${outputCurrency.symbol}`])
    } else {
      const localizedMaxSent = formatCurrencyAmount({ amount: trade.maximumAmountIn(slippage.allowed) })
      rows.push([t`Maximum sent`, `${localizedMaxSent} ${inputCurrency.symbol}`])
    }

    // rows.push([t`Slippage tolerance`, `${slippage.allowed.toFixed(2)}%`, slippage.warning])

    return rows
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
      <Rule />
      <Amount label="You pay" amount={inputAmount} fiatValue="$4122" />
      <Amount label="You receive" amount={outputAmount} fiatValue="$4122" />
    </Column>
  )
}
