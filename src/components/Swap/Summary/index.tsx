import { t, Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import ActionButton, { Action, ActionButtonColor } from 'components/ActionButton'
import Column from 'components/Column'
import { Header } from 'components/Dialog'
import { SmallToolTipBody, TooltipText } from 'components/Tooltip'
import { Allowance, AllowanceState } from 'hooks/usePermit2Allowance'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { AlertTriangle, Spinner } from 'icons'
import { useAtomValue } from 'jotai/utils'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { swapEventHandlersAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'

import SpeedBumpDialog from '../Speedbump'
import Details from './Details'
import SwapInputOutputEstimate from './Estimate'
import Summary from './Summary'

export default Summary

enum ReviewState {
  REVIEWING,
  ALLOWANCE_PENDING,
  ALLOWANCE_FAILED,
  TRADE_CHANGED,
  SWAP_PENDING,
}

function useReviewState(onSwap: () => void, allowance: Allowance, doesTradeDiffer: boolean) {
  const [currentState, setCurrentState] = useState(ReviewState.REVIEWING)

  const onStartSwapFlow = useCallback(async () => {
    if (allowance.state === AllowanceState.REQUIRED) {
      setCurrentState(ReviewState.ALLOWANCE_PENDING)
      try {
        await allowance.approveAndPermit?.()
      } catch (e) {
        console.error(e)
        setCurrentState(ReviewState.ALLOWANCE_FAILED)
      }
      // if the user finishes permit2 allowance flow, onStartSwapFlow() will be called again by useEffect below to trigger swap
    } else if (allowance.state === AllowanceState.ALLOWED) {
      setCurrentState(ReviewState.SWAP_PENDING)
      await onSwap()
      setCurrentState(ReviewState.REVIEWING)
    }
  }, [allowance, onSwap])

  // Automatically triggers signing swap tx if allowance requirements are met
  useEffect(() => {
    // Prevents swap if trade has updated mid permit2 flow
    if (doesTradeDiffer && (currentState === ReviewState.REVIEWING || currentState === ReviewState.ALLOWANCE_PENDING)) {
      setCurrentState(ReviewState.TRADE_CHANGED)
    } else if (currentState === ReviewState.ALLOWANCE_PENDING && allowance.state === AllowanceState.ALLOWED) {
      onStartSwapFlow()
    } else if (!doesTradeDiffer && currentState === ReviewState.TRADE_CHANGED) {
      setCurrentState(ReviewState.REVIEWING)
    }
  }, [allowance, currentState, doesTradeDiffer, onStartSwapFlow])

  const onCancel = useCallback(() => setCurrentState(ReviewState.REVIEWING), [])
  return { onStartSwapFlow, onCancel, currentState }
}

const Body = styled(Column)`
  height: 100%;
  padding: 0.75em 0.875em;
`

const PriceImpactText = styled.span`
  color: ${({ theme }) => theme.error};
`

function PermitTooltipText({ text, content }: { text: ReactNode; content: ReactNode }) {
  return (
    <TooltipText placement="bottom" offset={10} text={text}>
      <SmallToolTipBody>
        <ThemedText.Caption>{content}</ThemedText.Caption>
      </SmallToolTipBody>
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

export function ConfirmButton({
  trade,
  slippage,
  onConfirm,
  onAcknowledgeNewTrade,
  allowance,
}: {
  trade: InterfaceTrade
  slippage: Slippage
  onConfirm: () => Promise<void>
  onAcknowledgeNewTrade: () => void
  allowance: Allowance
}) {
  const { onSwapPriceUpdateAck, onSubmitSwapClick } = useAtomValue(swapEventHandlersAtom)
  const [ackTrade, setAckTrade] = useState(trade)
  const doesTradeDiffer = useMemo(
    () => Boolean(trade && ackTrade && tradeMeaningfullyDiffers(trade, ackTrade)),
    [ackTrade, trade]
  )
  const onSwap = useCallback(async () => {
    onSubmitSwapClick?.(trade)
    await onConfirm()
  }, [onConfirm, onSubmitSwapClick, trade])

  const { onStartSwapFlow, onCancel, currentState } = useReviewState(onSwap, allowance, doesTradeDiffer)

  const isApproved = useMemo(
    () => (allowance.state === AllowanceState.REQUIRED ? allowance.isApproved : true),
    [allowance]
  )

  const onAcknowledgeClick = useCallback(() => {
    onSwapPriceUpdateAck?.(ackTrade, trade)
    setAckTrade(trade)
    // Prompts parent to show speedbump if new trade has high impact
    onAcknowledgeNewTrade()
  }, [ackTrade, onAcknowledgeNewTrade, onSwapPriceUpdateAck, trade])

  const [action, color] = useMemo((): [Action?, ActionButtonColor?] => {
    switch (currentState) {
      case ReviewState.SWAP_PENDING:
        return [
          {
            message: <Trans>Confirm in your wallet</Trans>,
            icon: Spinner,
            onClick: onCancel,
            children: <Trans>Cancel</Trans>,
          },
          'interactive',
        ]
      case ReviewState.ALLOWANCE_PENDING:
        return [getAllowancePendingAction(isApproved, onCancel)]
      case ReviewState.ALLOWANCE_FAILED:
        return [getAllowanceFailedAction(isApproved, onStartSwapFlow), 'warningSoft']
      case ReviewState.TRADE_CHANGED:
        return [
          {
            color: 'accent',
            message: <Trans>Price updated</Trans>,
            icon: AlertTriangle,
            tooltipContent: (
              <SmallToolTipBody>
                <SwapInputOutputEstimate trade={trade} slippage={slippage} />
              </SmallToolTipBody>
            ),
            onClick: onAcknowledgeClick,
            children: <Trans>Accept</Trans>,
          },
        ]
      default:
        return []
    }
  }, [currentState, isApproved, onAcknowledgeClick, onCancel, onStartSwapFlow, slippage, trade])

  return (
    <ActionButton onClick={onStartSwapFlow} action={action} color={color ?? 'accent'} data-testid="swap-button">
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
