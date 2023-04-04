import { t, Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import ActionButton, { Action } from 'components/ActionButton'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { AlertTriangle, Spinner } from 'icons'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { WidoTrade } from 'state/routing/types'
import { swapEventHandlersAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'

import SpeedBumpDialog from '../Speedbump'
import Details from './Details'
import Summary from './Summary'

export default Summary

const Body = styled(Column)`
  height: 100%;
  padding: 0.75em 0.875em;
`
const PriceImpactText = styled.span`
  color: ${({ theme }) => theme.error};
`

function ConfirmButton({
  trade,
  onConfirm,
  onAcknowledgeNewTrade,
}: {
  trade: WidoTrade
  onConfirm: () => Promise<void>
  onAcknowledgeNewTrade: () => void
}) {
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
      return {
        message: <Trans>Confirm in your wallet</Trans>,
        icon: Spinner,
        onClick: () => {
          setIsPending(false)
        },
      }
    } else if (doesTradeDiffer) {
      return {
        color: 'accent',
        message: <Trans>Price updated</Trans>,
        icon: AlertTriangle,
        onClick: () => {
          onSwapPriceUpdateAck?.(ackTrade, trade)
          setAckTrade(trade)
          // Prompts parent to show speedbump if new trade has high impact
          onAcknowledgeNewTrade()
        },
        children: <Trans>Accept</Trans>,
      }
    }
    return
  }, [ackTrade, doesTradeDiffer, isPending, onAcknowledgeNewTrade, onSwapPriceUpdateAck, trade])

  return (
    <ActionButton onClick={onClick} action={action} color={isPending ? 'interactive' : 'accent'}>
      {isPending ? <Trans>Cancel</Trans> : <Trans>Confirm</Trans>}
    </ActionButton>
  )
}

interface SummaryDialogProps {
  trade: WidoTrade
  slippage: Slippage
  gasUseEstimate?: CurrencyAmount<Token>
  gasUseEstimateUSD?: CurrencyAmount<Token>
  inputUSDC?: CurrencyAmount<Currency>
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
  onConfirm: () => Promise<void>
}

export function SummaryDialog(props: SummaryDialogProps) {
  const [ackPriceImpact, setAckPriceImpact] = useState(false)
  const [showSpeedbump, setShowSpeedbump] = useState(props.impact?.warning === 'error')

  const onAcknowledgePriceImpact = useCallback(() => {
    setAckPriceImpact(true)
    setShowSpeedbump(false)
  }, [])

  const onAcknowledgeNewTrade = useCallback(() => {
    if (!showSpeedbump && !ackPriceImpact && props.impact?.warning === 'error') {
      setShowSpeedbump(true)
    }
  }, [ackPriceImpact, props.impact?.warning, showSpeedbump])

  useEffect(() => {
    if (showSpeedbump && props.impact?.warning !== 'error') {
      setShowSpeedbump(false)
    }
  }, [ackPriceImpact, props.impact, showSpeedbump])

  return (
    <>
      {showSpeedbump && props.impact ? (
        <SpeedBumpDialog onAcknowledge={onAcknowledgePriceImpact}>
          {t`This transaction will result in a`} <PriceImpactText>{props.impact.toString()} </PriceImpactText>
          {t`price impact on the market price of this pool. Do you wish to continue? `}
        </SpeedBumpDialog>
      ) : (
        <>
          <Header title={<Trans>Review</Trans>} />
          <Body flex align="stretch">
            <Details {...props} />
          </Body>
          <ConfirmButton {...props} onAcknowledgeNewTrade={onAcknowledgeNewTrade} />
        </>
      )}
    </>
  )
}
