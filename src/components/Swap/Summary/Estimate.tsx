import { t } from '@lingui/macro'
import { Slippage } from 'hooks/useSlippage'
import { useMemo } from 'react'
import { WidoTrade } from 'state/routing/types'
import { calcMinimumAmountOut } from 'state/routing/utils'
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
  trade: WidoTrade
}

export default function SwapInputOutputEstimate({ trade, slippage }: EstimateProps) {
  const { estimateMessage } = useMemo(() => getEstimateMessage(trade, slippage), [slippage, trade])
  return <StyledEstimate color="secondary">{estimateMessage}</StyledEstimate>
}

export function getEstimateMessage(trade: WidoTrade, slippage: Slippage) {
  const { outputAmount } = trade
  const outputCurrency = outputAmount.currency

  if (isExactInput(trade.tradeType)) {
    const localizedMinReceived = calcMinimumAmountOut(slippage.allowed, trade.outputAmount).toSignificant().toString()
    const minReceivedString = `${localizedMinReceived} ${outputCurrency.symbol}`

    return {
      estimateMessage: t`Output is estimated. You will receive at least ${minReceivedString} or the transaction will revert.`,
      descriptor: t`Minimum output after slippage`,
      value: minReceivedString,
    }
  } else {
    throw new Error('Not implemented: isExactOutput')
  }
}
