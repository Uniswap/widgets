import { t } from '@lingui/macro'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { formatSlippage, Slippage } from 'hooks/useSlippage'
import { ReactNode, useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { isExactInput } from 'utils/tradeType'

const StyledEstimate = styled(ThemedText.Caption)`
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  max-height: 3rem;
`

interface EstimateProps {
  slippage: Slippage
  trade: InterfaceTrade
}

export default function SwapInputOutputEstimate({ trade, slippage }: EstimateProps) {
  const { estimateMessage } = useMemo(() => getEstimateMessage(trade, slippage), [slippage, trade])
  return <StyledEstimate color="secondary">{estimateMessage}</StyledEstimate>
}

export function getEstimateMessage(
  trade: InterfaceTrade | undefined,
  slippage: Slippage
): {
  estimateMessage: string
  descriptor: ReactNode
  value: string
} {
  if (!trade) {
    return {
      estimateMessage: '',
      descriptor: '',
      value: '-',
    }
  }
  const { inputAmount, outputAmount } = trade
  const inputCurrency = inputAmount.currency
  const outputCurrency = outputAmount.currency

  if (isExactInput(trade.tradeType)) {
    const localizedMinReceived = formatCurrencyAmount(trade.minimumAmountOut(slippage.allowed), NumberType.TokenTx)
    const minReceivedString = `${localizedMinReceived} ${outputCurrency.symbol}`

    return {
      estimateMessage: t`Output is estimated. You will receive at least ${minReceivedString} or the transaction will revert.`,
      descriptor: (
        <ThemedText.Body2>
          {t`Minimum output after slippage`}
          {slippage && (
            <ThemedText.Body2 $inline color={slippage?.warning ?? 'secondary'}>
              {' '}
              ({formatSlippage(slippage)})
            </ThemedText.Body2>
          )}
        </ThemedText.Body2>
      ),
      value: minReceivedString,
    }
  } else {
    const localizedMaxSent = formatCurrencyAmount(trade.maximumAmountIn(slippage.allowed), NumberType.TokenTx)
    const maxSentString = `${localizedMaxSent} ${inputCurrency.symbol}`

    return {
      estimateMessage: t`Output is estimated. You will send at most ${maxSentString} or the transaction will revert.`,
      descriptor: (
        <ThemedText.Body2>
          {t`Maximum input after slippage`}
          {slippage && (
            <ThemedText.Body2 $inline color={slippage?.warning ?? 'secondary'}>
              {' '}
              ({formatSlippage(slippage)})
            </ThemedText.Body2>
          )}
        </ThemedText.Body2>
      ),
      value: maxSentString,
    }
  }
}
