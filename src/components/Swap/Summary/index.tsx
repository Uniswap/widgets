import { t, Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import ActionButton, { Action, ActionButtonColor } from 'components/ActionButton'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import { TooltipText } from 'components/Tooltip'
import { Allowance, AllowanceState } from 'hooks/usePermit2Allowance'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { AlertTriangle, Spinner } from 'icons'
import { useAtomValue } from 'jotai/utils'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { swapEventHandlersAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
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

const PermitTooltipBody = styled.div`
  max-width: 220px;
`

function PermitTooltipText({ text, content }: { text: ReactNode; content: ReactNode }) {
  return (
    <TooltipText placement="bottom" offset={10} text={text}>
      <PermitTooltipBody>
        <ThemedText.Caption>{content}</ThemedText.Caption>
      </PermitTooltipBody>
    </TooltipText>
  )
}

function getAllowanceFailedAction(isApproved: boolean, retry: () => void): Action {
  return {
    message: isApproved ? (
      <PermitTooltipText
        text={t`Token approval failed`}
        content={t`A signature is needed to trade this token on the Uniswap protocol. For security, signatures expire after 30 days.`}
      />
    ) : (
      <PermitTooltipText
        text={t`Permit approval failed`}
        content={t`Permit2 allows safe sharing and management of token approvals across different smart contracts.`}
      />
    ),
    onClick: retry,
    color: 'warning',
    children: <Trans>Try again</Trans>,
  }
}

function getAllowancePendingAction(isApproved: boolean, cancel: () => void): Action {
  return {
    message: isApproved ? (
      <PermitTooltipText
        text={t`Approve token for trading`}
        content={t`Gives you the ability to trade this token on the Uniswap protocol. For security, this will expire in 30 days.`}
      />
    ) : (
      <PermitTooltipText
        text={t`Approve permit`}
        content={t`Permit2 allows safe sharing and management of token approvals across different smart contracts.`}
      />
    ),
    icon: Spinner,
    onClick: cancel,
    children: <Trans>Cancel</Trans>,
  }
}

enum ReviewState {
  REVIEWING,
  ALLOWANCE_PENDING,
  ALLOWANCE_FAILED,
  TRADE_CHANGED,
  PENDING_SWAP,
}

function ConfirmButton({
  trade,
  onConfirm,
  onAcknowledgeNewTrade,
  allowance,
}: {
  trade: InterfaceTrade
  onConfirm: () => Promise<void>
  onAcknowledgeNewTrade: () => void
  allowance: Allowance
}) {
  const [reviewState, setReviewState] = useState(ReviewState.REVIEWING)

  const { onSwapPriceUpdateAck, onSubmitSwapClick } = useAtomValue(swapEventHandlersAtom)
  const [ackTrade, setAckTrade] = useState(trade)
  const doesTradeDiffer = useMemo(
    () => Boolean(trade && ackTrade && tradeMeaningfullyDiffers(trade, ackTrade)),
    [ackTrade, trade]
  )
  useEffect(() => {
    if (doesTradeDiffer && reviewState === ReviewState.REVIEWING) {
      setReviewState(ReviewState.TRADE_CHANGED)
    } else if (!doesTradeDiffer && reviewState === ReviewState.TRADE_CHANGED) {
      setReviewState(ReviewState.REVIEWING)
    }
  }, [reviewState, doesTradeDiffer])

  const isApproved = useMemo(
    () => (allowance.state === AllowanceState.REQUIRED ? allowance.isApproved : true),
    [allowance]
  )

  const triggerSwap = useCallback(async () => {
    setReviewState(ReviewState.PENDING_SWAP)
    onSubmitSwapClick?.(trade)
    await onConfirm()
    setReviewState(ReviewState.REVIEWING)
  }, [onConfirm, onSubmitSwapClick, trade])

  const prevAllowanceRef = useRef(allowance)
  // Ensures swap isn't submitted until allowance has been properly updated post-permit2 flow
  useEffect(() => {
    if (prevAllowanceRef.current.state === AllowanceState.REQUIRED && allowance.state === AllowanceState.ALLOWED) {
      // Prevents swap if trade has updated mid permit2 flow
      if (doesTradeDiffer) setReviewState(ReviewState.TRADE_CHANGED)
      else triggerSwap()
    }
    prevAllowanceRef.current = allowance
  }, [allowance, doesTradeDiffer, triggerSwap])

  const triggerPermit2Flow = useCallback(async () => {
    if (allowance.state === AllowanceState.REQUIRED) {
      setReviewState(ReviewState.ALLOWANCE_PENDING)
      try {
        await allowance.approveAndPermit?.()
      } catch (e) {
        console.error(e)
        setReviewState(ReviewState.ALLOWANCE_FAILED)
      }
    }
  }, [allowance])

  const onClick = useCallback(() => {
    if (allowance.state === AllowanceState.REQUIRED) {
      triggerPermit2Flow()
      // if the user finishes permit2 allowance flow, triggerSwap() is called by useEffect above once state updates
    } else if (allowance.state === AllowanceState.ALLOWED) {
      triggerSwap()
    }
  }, [allowance, triggerPermit2Flow, triggerSwap])

  const [action, color] = useMemo((): [Action | undefined, ActionButtonColor?] => {
    switch (reviewState) {
      case ReviewState.PENDING_SWAP:
        return [
          {
            message: <Trans>Confirm in your wallet</Trans>,
            icon: Spinner,
            onClick: () => setReviewState(ReviewState.REVIEWING),
            children: <Trans>Cancel</Trans>,
          },
          'interactive',
        ]
      case ReviewState.ALLOWANCE_PENDING:
        return [getAllowancePendingAction(isApproved, () => setReviewState(ReviewState.REVIEWING))]
      case ReviewState.ALLOWANCE_FAILED:
        return [getAllowanceFailedAction(isApproved, () => triggerPermit2Flow()), 'warningSoft']
      case ReviewState.TRADE_CHANGED:
        return [
          {
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
          },
        ]
      default:
        return [undefined, undefined]
    }
  }, [ackTrade, isApproved, onAcknowledgeNewTrade, onSwapPriceUpdateAck, reviewState, trade, triggerPermit2Flow])

  return (
    <ActionButton onClick={onClick} action={action} color={color ?? 'accent'}>
      <Trans>Swap</Trans>
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
  allowance: Allowance
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
          <Header title={<Trans>Review swap</Trans>} />
          <Body flex align="stretch">
            <Details {...props} />
          </Body>
          <ConfirmButton {...props} onAcknowledgeNewTrade={onAcknowledgeNewTrade} />
        </>
      )}
    </>
  )
}
