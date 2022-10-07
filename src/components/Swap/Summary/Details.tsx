import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Column from 'components/Column'
import Row from 'components/Row'
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
import { formatPercentage } from 'utils/formatPercentage'
import { computeRealizedLPFeeAmount } from 'utils/prices'
import { isExactInput } from 'utils/tradeType'

const Value = styled.span<{ color?: Color }>`
  color: ${({ color, theme }) => color && theme[color]};
  white-space: nowrap;
`

interface DetailProps {
  label: string
  value: string
  color?: Color
}

function Detail({ label, value, color }: DetailProps) {
  return (
    <ThemedText.Caption userSelect>
      <Row gap={2}>
        <span>{label}</span>
        <Value color={color}>{value}</Value>
      </Row>
    </ThemedText.Caption>
  )
}

interface DetailsProps {
  trade: InterfaceTrade
  slippage: Slippage
  impact?: PriceImpact
}

export default function Details({ trade, slippage, impact }: DetailsProps) {
  const { inputAmount, outputAmount } = trade
  const inputCurrency = inputAmount.currency
  const outputCurrency = outputAmount.currency
  const integrator = window.location.hostname
  const feeOptions = useAtomValue(feeOptionsAtom)
  const lpFeeAmount = useMemo(() => computeRealizedLPFeeAmount(trade), [trade])
  const { i18n } = useLingui()

  const details = useMemo(() => {
    const rows: Array<[string, string] | [string, string, Color | undefined]> = []
    // @TODO(ianlapham): Check that provider fee is even a valid list item

    if (feeOptions) {
      const fee = outputAmount.multiply(feeOptions.fee)
      if (fee.greaterThan(0)) {
        const parsedFee = formatCurrencyAmount(fee, 6, i18n.locale)
        rows.push([t`${integrator} fee`, `${parsedFee} ${outputCurrency.symbol || currencyId(outputCurrency)}`])
      }
    }

    if (impact) {
      rows.push([t`Price impact`, formatPercentage(impact.percent), impact.warning])
    }

    if (lpFeeAmount) {
      const parsedLpFee = formatCurrencyAmount(lpFeeAmount, 6, i18n.locale)
      rows.push([t`Liquidity provider fee`, `${parsedLpFee} ${inputCurrency.symbol || currencyId(inputCurrency)}`])
    }

    if (isExactInput(trade.tradeType)) {
      const localizedMaxSent = formatCurrencyAmount(trade.minimumAmountOut(slippage.allowed), 6, i18n.locale)
      rows.push([t`Minimum received`, `${localizedMaxSent} ${outputCurrency.symbol}`])
    } else {
      const localizedMaxSent = formatCurrencyAmount(trade.maximumAmountIn(slippage.allowed), 6, i18n.locale)
      rows.push([t`Maximum sent`, `${localizedMaxSent} ${inputCurrency.symbol}`])
    }

    rows.push([t`Slippage tolerance`, `${slippage.allowed.toFixed(2)}%`, slippage.warning])

    return rows
  }, [
    feeOptions,
    i18n.locale,
    impact,
    inputCurrency,
    integrator,
    lpFeeAmount,
    outputAmount,
    outputCurrency,
    slippage,
    trade,
  ])

  return (
    <Column gap={0.5}>
      {details.map(([label, detail, color]) => (
        <Detail key={label} label={label} value={detail} color={color} />
      ))}
    </Column>
  )
}
