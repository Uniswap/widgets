import { Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import ActionButton, { Action } from 'components/ActionButton'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import BaseExpando from 'components/Expando'
import Row from 'components/Row'
import { Slippage } from 'hooks/useSlippage'
import { PriceImpact } from 'hooks/useUSDCPriceImpact'
import { AlertTriangle, BarChart, Info, Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'

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
  return (
    <Row gap={0.5}>
      {impact?.warning || slippage.warning ? (
        <AlertTriangle color={impact?.warning || slippage.warning} />
      ) : (
        <Info color="secondary" />
      )}
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
  trade: Trade<Currency, Currency, TradeType>
}

function Estimate({ trade, slippage }: EstimateProps) {
  const { i18n } = useLingui()
  const text = useMemo(() => {
    switch (trade.tradeType) {
      case TradeType.EXACT_INPUT:
        return (
          <Trans>
            Output is estimated. You will receive at least{' '}
            {formatCurrencyAmount(trade.minimumAmountOut(slippage.allowed), 6, i18n.locale)}{' '}
            {trade.outputAmount.currency.symbol} or the transaction will revert.
          </Trans>
        )
      case TradeType.EXACT_OUTPUT:
        return (
          <Trans>
            Output is estimated. You will send at most{' '}
            {formatCurrencyAmount(trade.maximumAmountIn(slippage.allowed), 6, i18n.locale)}{' '}
            {trade.inputAmount.currency.symbol} or the transaction will revert.
          </Trans>
        )
    }
  }, [i18n.locale, slippage.allowed, trade])
  return <StyledEstimate color="secondary">{text}</StyledEstimate>
}

function ConfirmButton({
  trade,
  highPriceImpact,
  onConfirm,
}: {
  trade: Trade<Currency, Currency, TradeType>
  highPriceImpact: boolean
  onConfirm: () => Promise<void>
}) {
  const [ackPriceImpact, setAckPriceImpact] = useState(false)

  const [ackTrade, setAckTrade] = useState(trade)
  const doesTradeDiffer = useMemo(
    () => Boolean(trade && ackTrade && tradeMeaningfullyDiffers(trade, ackTrade)),
    [ackTrade, trade]
  )

  const [isPending, setIsPending] = useState(false)
  const onClick = useCallback(async () => {
    setIsPending(true)
    await onConfirm()
    setIsPending(false)
  }, [onConfirm])

  const action = useMemo((): Action | undefined => {
    if (isPending) {
      return { message: <Trans>Confirm in your wallet</Trans>, icon: Spinner }
    } else if (doesTradeDiffer) {
      return {
        message: <Trans>Price updated</Trans>,
        icon: BarChart,
        onClick: () => setAckTrade(trade),
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
  }, [ackPriceImpact, doesTradeDiffer, highPriceImpact, isPending, trade])

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
  trade: Trade<Currency, Currency, TradeType>
  slippage: Slippage
  inputUSDC?: CurrencyAmount<Currency>
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
  onConfirm: () => Promise<void>
}

export function SummaryDialog({ trade, slippage, inputUSDC, outputUSDC, impact, onConfirm }: SummaryDialogProps) {
  const { inputAmount, outputAmount } = trade

  const [open, setOpen] = useState(false)
  const onExpand = useCallback(() => {
    setOpen((open) => !open)
  }, [])

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
          <Details trade={trade} slippage={slippage} impact={impact} />
          <Estimate trade={trade} slippage={slippage} />
        </Expando>

        <ConfirmButton trade={trade} highPriceImpact={impact?.warning === 'error'} onConfirm={onConfirm} />
      </Body>
    </>
  )
}
