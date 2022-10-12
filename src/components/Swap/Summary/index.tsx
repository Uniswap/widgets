import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import ActionButton, { Action } from 'components/ActionButton'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import BaseExpando from 'components/Expando'
import Row from 'components/Row'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { AlertTriangle, BarChart, Info, Spinner } from 'icons'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { swapEventHandlersAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'
import { isExactInput } from 'utils/tradeType'

import Price from '../Price'
import Details from './Details'
import Summary from './Summary'

export default Summary

const Expando = styled(BaseExpando)`
  margin-bottom: 3.2em;
  transition: gap 0.25s;
`
const Heading = styled(Column)`
  flex-grow: 1;
  transition: flex-grow 0.25s;
`
const StyledEstimate = styled(ThemedText.Caption)`
  margin-bottom: 0.5em;
  margin-top: 0.5em;
  max-height: 3em;
`
const Body = styled(Column)`
  height: calc(100% - 2.5em);
`

function Subhead({ impact, slippage }: { impact?: PriceImpact; slippage: Slippage }) {
  const showWarning = Boolean(impact?.warning || slippage.warning)
  return (
    <Row gap={0.5}>
      {showWarning ? <AlertTriangle color={impact?.warning || slippage.warning} /> : <Info color="secondary" />}
      <ThemedText.Subhead2 color={impact?.warning || slippage.warning || 'secondary'}>
        {impact?.warning ? (
          <Trans>High price impact</Trans>
        ) : slippage.warning ? (
          <Trans>High slippage</Trans>
        ) : (
          <Trans>Swap details</Trans>
        )}
      </ThemedText.Subhead2>
    </Row>
  )
}

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
      wrapperProps={{
        style: {
          bottom: '0.25em',
          position: 'absolute',
          width: 'calc(100% - 1.5em)',
        },
      }}
    >
      <Trans>Confirm swap</Trans>
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

export function SummaryDialog({
  trade,
  slippage,
  gasUseEstimateUSD,
  inputUSDC,
  outputUSDC,
  impact,
  onConfirm,
}: SummaryDialogProps) {
  const { inputAmount, outputAmount } = trade

  const [open, setOpen] = useState(false)
  const { onExpandSwapDetails } = useAtomValue(swapEventHandlersAtom)
  const onExpand = useCallback(() => {
    onExpandSwapDetails?.()
    setOpen((open) => !open)
  }, [onExpandSwapDetails])

  return (
    <>
      <Header title={<Trans>Swap summary</Trans>} ruled />
      <Body flex align="stretch" padded gap={0.75}>
        <Heading gap={0.75} flex justify="center">
          <Summary
            input={inputAmount}
            output={outputAmount}
            inputUSDC={inputUSDC}
            outputUSDC={outputUSDC}
            impact={impact}
            open={open}
          />
          <Price trade={trade} />
        </Heading>
        <Expando
          title={<Subhead impact={impact} slippage={slippage} />}
          open={open}
          onExpand={onExpand}
          height={6}
          gap={open ? 0 : 0.75}
        >
          <Column gap={0.5}>
            <Details trade={trade} slippage={slippage} gasUseEstimateUSD={gasUseEstimateUSD} impact={impact} />
            <Estimate trade={trade} slippage={slippage} />
          </Column>
        </Expando>

        <ConfirmButton trade={trade} highPriceImpact={impact?.warning === 'error'} onConfirm={onConfirm} />
      </Body>
    </>
  )
}
