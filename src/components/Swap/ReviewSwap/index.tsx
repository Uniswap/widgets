import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import ActionButton, { Action } from 'components/ActionButton'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { BarChart, Spinner } from 'icons'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { swapEventHandlersAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'
import { isExactInput } from 'utils/tradeType'

import Details from './Details'
import Summary from './Summary'

export default Summary

const StyledEstimate = styled(ThemedText.Caption)`
  margin-bottom: 0.5em;
  margin-top: 0.5em;
  max-height: 3em;
`
const Body = styled(Column)`
  height: calc(100% - 2.5em);
`

interface EstimateProps {
  slippage: Slippage
  trade: InterfaceTrade
}

function Estimate({ trade, slippage }: EstimateProps) {
  const text = useMemo(
    () =>
      isExactInput(trade.tradeType) ? (
        <Trans>
          Output is estimated. You will receive at least{' '}
          {formatCurrencyAmount({ amount: trade.minimumAmountOut(slippage.allowed) })}{' '}
          {trade.outputAmount.currency.symbol} or the transaction will revert.
        </Trans>
      ) : (
        <Trans>
          Output is estimated. You will send at most{' '}
          {formatCurrencyAmount({ amount: trade.maximumAmountIn(slippage.allowed) })}{' '}
          {trade.inputAmount.currency.symbol} or the transaction will revert.
        </Trans>
      ),
    [slippage.allowed, trade]
  )
  return <StyledEstimate color="secondary">{text}</StyledEstimate>
}

function ConfirmButton({
  trade,
  highPriceImpact,
  onConfirm,
}: {
  trade: InterfaceTrade
  highPriceImpact: boolean
  onConfirm: () => Promise<void>
}) {
  const [ackPriceImpact, setAckPriceImpact] = useState(false)

  const { onSwapPriceUpdateAck, onSubmitSwapClick } = useAtomValue(swapEventHandlersAtom)
  const [ackTrade, setAckTrade] = useState(trade)
  const doesTradeDiffer = useMemo(
    () => Boolean(trade && ackTrade && tradeMeaningfullyDiffers(trade, ackTrade)),
    [ackTrade, trade]
  )

  const [isPending, setIsPending] = useState(false)
  const onClick = useCallback(async () => {
    setIsPending(true)
    onSubmitSwapClick?.(trade)
    await onConfirm()
    setIsPending(false)
  }, [onConfirm, onSubmitSwapClick, trade])

  const action = useMemo((): Action | undefined => {
    if (isPending) {
      return { message: <Trans>Confirm in your wallet</Trans>, icon: Spinner }
    } else if (doesTradeDiffer) {
      return {
        message: <Trans>Price updated</Trans>,
        icon: BarChart,
        onClick: () => {
          onSwapPriceUpdateAck?.(ackTrade, trade)
          setAckTrade(trade)
        },
        children: <Trans>Accept</Trans>,
      }
    } else if (highPriceImpact && !ackPriceImpact) {
      return {
        message: <Trans>High price impact</Trans>,
        onClick: () => setAckPriceImpact(true),
        children: <Trans>Acknowledge</Trans>,
      }
    }
    return
  }, [ackPriceImpact, ackTrade, doesTradeDiffer, highPriceImpact, isPending, onSwapPriceUpdateAck, trade])

  return (
    <ActionButton
      onClick={onClick}
      action={action}
      disabled={isPending}
      wrapperProps={{
        style: {
          bottom: '0.25em',
          position: 'absolute',
          width: 'calc(100% - 1.5em)',
        },
      }}
    >
      {isPending ? <Trans>Confirm</Trans> : <Trans>Confirm swap</Trans>}
    </ActionButton>
  )
}

interface SummaryDialogProps {
  trade: InterfaceTrade
  slippage: Slippage
  gasUseEstimateUSD?: CurrencyAmount<Token>
  inputUSDC?: CurrencyAmount<Currency>
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
  onConfirm: () => Promise<void>
}

export function SummaryDialog(props: SummaryDialogProps) {
  return (
    <>
      <Header title={<Trans>Review Swap</Trans>} />
      <Body flex align="stretch" padded gap={0.75}>
        <Column gap={0.5}>
          <Details {...props} />
          <Estimate {...props} />
        </Column>
        <ConfirmButton {...props} highPriceImpact={props.impact?.warning === 'error'} />
      </Body>
    </>
  )
}
