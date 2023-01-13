import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import ActionButton, { Action } from 'components/ActionButton'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { AlertTriangle, Spinner } from 'icons'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { swapEventHandlersAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'

import Details from './Details'
import Summary from './Summary'

export default Summary

const Body = styled(Column)`
  height: 100%;
  padding: 0.75em 0.875em;
`

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
        color: 'accent',
        message: <Trans>Price updated</Trans>,
        icon: AlertTriangle,
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
    <ActionButton onClick={onClick} action={action} disabled={isPending}>
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
      <Header title={<Trans>Review swap</Trans>} />
      <Body flex align="stretch">
        <Details {...props} />
      </Body>
      <ConfirmButton {...props} highPriceImpact={props.impact?.warning === 'error'} />
    </>
  )
}
