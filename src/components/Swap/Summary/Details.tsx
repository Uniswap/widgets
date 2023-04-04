import { t } from '@lingui/macro'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import Column from 'components/Column'
import EtherscanLink from 'components/EtherscanLink'
import Row from 'components/Row'
import Rule from 'components/Rule'
import Tooltip from 'components/Tooltip'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { useRecipientAddress } from 'hooks/useSyncWidgetSettings'
import { useWidgetWidth } from 'hooks/useWidgetWidth'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { WidoTrade } from 'state/routing/types'
import { feeOptionsAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { Color, ThemedText } from 'theme'
import { WIDGET_BREAKPOINTS } from 'theme/breakpoints'
import { shortenAddress } from 'utils'
import { currencyId } from 'utils/currencyId'
import { ExplorerDataType } from 'utils/getExplorerLink'

import { useTradeExchangeRate } from '../Price'
import { getEstimateMessage } from './Estimate'

const Label = styled.span`
  color: ${({ theme }) => theme.secondary};
  margin-right: 0.5em;
  /* max-width: 50%; */
`
const Value = styled.span<{ color?: Color }>`
  color: ${({ color, theme }) => color && theme[color]};
  text-align: end;
`

const DetailValue = styled(Value)`
  /* max-width: 45%; */
  overflow-wrap: break-word;
`

const Overflowable = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const ToolTipBody = styled(ThemedText.Caption)`
  max-width: 220px;
`

interface AmountProps {
  tooltipText?: string
  label: string
  amount: CurrencyAmount<Currency>
  usdcAmount?: CurrencyAmount<Currency>
}

function Amount({ tooltipText, label, amount, usdcAmount }: AmountProps) {
  const width = useWidgetWidth()
  const [amountFontSize, amountLineHeight] = ['24px', '30px']
  // width < WIDGET_BREAKPOINTS.MEDIUM
  //   ? width < WIDGET_BREAKPOINTS.EXTRA_SMALL
  //     ? ['24px', '30px']
  //     : ['30px', '36px']
  //      : ['36px', '44px']

  let formattedAmount = formatCurrencyAmount(amount, NumberType.TokenTx)
  if (formattedAmount.length > MAX_AMOUNT_STR_LENGTH) {
    formattedAmount =
      width < WIDGET_BREAKPOINTS.EXTRA_WIDE
        ? formatCurrencyAmount(amount, NumberType.TokenNonTx)
        : formatCurrencyAmount(amount, NumberType.SwapTradeAmount)
  }

  return (
    <Row flex align="flex-start">
      <Row>
        <ThemedText.Body2 userSelect>
          <Label>{label}</Label>
        </ThemedText.Body2>
        {tooltipText && (
          <Tooltip placement="right" offset={8}>
            <ToolTipBody>{tooltipText}</ToolTipBody>
          </Tooltip>
        )}
      </Row>

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
  trade: WidoTrade
  slippage: Slippage
  gasUseEstimate?: CurrencyAmount<Token>
  gasUseEstimateUSD?: CurrencyAmount<Token>
  inputUSDC?: CurrencyAmount<Currency>
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
}

export default function Details({
  trade,
  slippage,
  gasUseEstimate,
  gasUseEstimateUSD,
  inputUSDC,
  outputUSDC,
  impact,
}: DetailsProps) {
  const { inputAmount, outputAmount } = trade
  const outputCurrency = outputAmount.currency
  const integrator = window.location.hostname
  const feeOptions = useAtomValue(feeOptionsAtom)
  const [exchangeRate] = useTradeExchangeRate(trade)
  const recipientAddress = useRecipientAddress(outputCurrency.chainId)

  const { details, estimateMessage, fromTooltipMessage } = useMemo(() => {
    const details: Array<[string, string] | [string, string, Color | undefined]> = []

    details.push([t`Exchange rate`, exchangeRate])

    if (feeOptions) {
      const fee = outputAmount.multiply(feeOptions.fee)
      if (fee.greaterThan(0)) {
        const parsedFee = formatCurrencyAmount(fee, NumberType.FiatGasPrice)
        details.push([t`${integrator} fee`, `${parsedFee} ${outputCurrency.symbol || currencyId(outputCurrency)}`])
      }
    }

    details.push([
      t`Network fee`,
      gasUseEstimateUSD
        ? `~${formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)}`
        : gasUseEstimate
        ? `${formatCurrencyAmount(gasUseEstimate, NumberType.TokenTx)} ${gasUseEstimate.currency.symbol}`
        : '-',
    ])

    if (impact) {
      details.push([t`Price impact`, impact.toString(), impact.warning])
    }

    const { estimateMessage, descriptor, value } = getEstimateMessage(trade, slippage)
    details.push([descriptor, value])

    return {
      details,
      estimateMessage,
      fromTooltipMessage: t`Input is approximated. You will spend exactly ${inputAmount.toSignificant()} ${
        outputCurrency.symbol
      }.`,
    }
  }, [
    exchangeRate,
    feeOptions,
    gasUseEstimate,
    gasUseEstimateUSD,
    impact,
    integrator,
    inputAmount,
    outputAmount,
    outputCurrency,
    slippage,
    trade,
  ])

  return (
    <>
      <Column gap={0.75}>
        <Amount label={t`From`} amount={inputAmount} usdcAmount={inputUSDC} tooltipText={fromTooltipMessage} />
        <Amount label={t`To`} amount={outputAmount} usdcAmount={outputUSDC} tooltipText={estimateMessage} />
        <RuleWrapper>
          <Rule />
        </RuleWrapper>
      </Column>
      <Column gap={0.75}>
        <ThemedText.Body2 userSelect>
          <Row flex align="flex-start">
            <Label>Recipient</Label>
            <DetailValue>
              <EtherscanLink
                type={ExplorerDataType.ADDRESS}
                data={recipientAddress}
                showIcon
                chainIdOverride={outputCurrency.chainId}
              >
                <Overflowable>{shortenAddress(recipientAddress)}</Overflowable>
              </EtherscanLink>
            </DetailValue>
          </Row>
        </ThemedText.Body2>
        {details.map(([label, detail, color]) => (
          <Detail key={label} label={label} value={detail} color={color} />
        ))}
      </Column>
    </>
  )
}
