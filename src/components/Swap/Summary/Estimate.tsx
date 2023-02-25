import { t, Trans } from '@lingui/macro'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { ReactNode, useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { isExactInput } from 'utils/tradeType'

const StyledEstimate = styled(ThemedText.Caption)`
  margin-bottom: 0.5em;
  margin-top: 0.5em;
  max-height: 3em;
`

interface EstimateProps {
  slippage: Slippage
  trade: InterfaceTrade
}

export default function SwapInputOutputEstimate({ trade, slippage }: EstimateProps) {
  const { estimateMessage } = useMemo(
    () => getEstimateMessage(trade, slippage, undefined /* priceImpact */),
    [slippage, trade]
  )
  return <StyledEstimate color="secondary">{estimateMessage}</StyledEstimate>
}

export function getEstimateMessage(
  trade: InterfaceTrade,
  slippage: Slippage,
  priceImpact: PriceImpact | undefined
): {
  estimateMessage: string
  descriptor: ReactNode
  value: string
} {
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
          <Trans>Minimum output after slippage</Trans>
          {priceImpact && (
            <ThemedText.Body2 $inline color={slippage?.warning ?? 'secondary'}>
              {' '}
              ({priceImpact?.toString()})
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
          <Trans>Maximum input after slippage</Trans>
          {priceImpact && (
            <ThemedText.Body2 $inline color={slippage?.warning ?? 'secondary'}>
              {' '}
              ({priceImpact?.toString()})
            </ThemedText.Body2>
          )}
        </ThemedText.Body2>
      ),
      value: maxSentString,
    }
  }
}
