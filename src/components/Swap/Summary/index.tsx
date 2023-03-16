import { t, Trans } from '@lingui/macro'
import { formatPriceImpact } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import ActionButton, { Action, ActionButtonColor } from 'components/ActionButton'
import Column from 'components/Column'
import { Header, MIN_PAGE_CENTERED_DIALOG_WIDTH, useCloseDialog, useIsDialogPageCentered } from 'components/Dialog'
import { PopoverBoundaryProvider } from 'components/Popover'
import { SmallToolTipBody, TooltipText } from 'components/Tooltip'
import { UserRejectedRequestError } from 'errors'
import { Allowance, AllowanceState } from 'hooks/usePermit2Allowance'
import { PriceImpact } from 'hooks/usePriceImpact'
import { Slippage } from 'hooks/useSlippage'
import { useWindowWidth } from 'hooks/useWindowWidth'
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
  ALLOWING,
  ALLOWANCE_FAILED,
  SWAP_PENDING,
}

function useReviewState(onSwap: () => Promise<void>, allowance: Allowance, doesTradeDiffer: boolean) {
  const [currentState, setCurrentState] = useState(ReviewState.REVIEWING)
  const closeDialog = useCloseDialog()

  const onStartSwapFlow = useCallback(async () => {
    if (allowance.state === AllowanceState.REQUIRED) {
      setCurrentState(ReviewState.ALLOWING)
      try {
        await allowance.approveAndPermit?.()
      } catch (e) {
        if (e instanceof UserRejectedRequestError) {
          closeDialog?.()
          setCurrentState(ReviewState.REVIEWING)
        } else {
          setCurrentState(ReviewState.ALLOWANCE_FAILED)
        }
      }
      // if the user finishes permit2 allowance flow, onStartSwapFlow() will be called again by useEffect below to trigger swap
    } else if (allowance.state === AllowanceState.ALLOWED) {
      // Prevents immediate swap if trade has updated mid permit2 flow
      if (currentState === ReviewState.ALLOWING && doesTradeDiffer) {
        setCurrentState(ReviewState.REVIEWING)
        return
      } else {
        setCurrentState(ReviewState.SWAP_PENDING)
        await onSwap()
        setCurrentState(ReviewState.REVIEWING)
      }
    }
  }, [allowance, currentState, doesTradeDiffer, onSwap, closeDialog])

  // Automatically triggers signing swap tx if allowance requirements are met
  useEffect(() => {
    if (currentState === ReviewState.ALLOWING && allowance.state === AllowanceState.ALLOWED) {
      onStartSwapFlow()
    }
  }, [allowance, currentState, doesTradeDiffer, onStartSwapFlow])

  const onCancel = useCallback(() => setCurrentState(ReviewState.REVIEWING), [])
  return { onStartSwapFlow, onCancel, currentState }
}

const Body = styled(Column)`
  margin: 0.75rem 0.875rem;
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

function getAllowanceFailedAction(shouldRequestApproval: boolean, retry: () => void, currency: Currency): Action {
  return {
    message: shouldRequestApproval ? (
      <PermitTooltipText
        text={t`Permit2 approval failed`}
        content={t`Permit2 allows safe sharing and management of token approvals across different smart contracts.`}
      />
    ) : (
      <PermitTooltipText
        text={t`${currency.symbol ?? 'token'} approval failed`}
        content={t`A signature is needed to trade this token on the Uniswap protocol. For security, signatures expire after 30 days.`}
      />
    ),
    onClick: retry,
    color: 'warning',
    children: <Trans>Try again</Trans>,
  }
}

function getAllowancePendingAction(shouldRequestApproval: boolean, cancel: () => void, currency: Currency): Action {
  return {
    message: shouldRequestApproval ? (
      <PermitTooltipText
        text={t`Approve Permit2`}
        content={t`Permit2 allows safe sharing and management of token approvals across different smart contracts.`}
      />
    ) : (
      <PermitTooltipText
        text={t`Approve ${currency.symbol ?? 'token'} for trading`}
        content={t`Gives you the ability to trade this token on the Uniswap protocol. For security, this will expire in 30 days.`}
      />
    ),
    icon: Spinner,
    onClick: cancel,
    children: <Trans>Cancel</Trans>,
  }
}

function getApprovalLoadingAction(): Action {
  return {
    message: (
      <PermitTooltipText
        text={t`Confirming approval`}
        content={t`The network is confirming your Permit2 approval before you can swap.`}
      />
    ),
    icon: Spinner,
    children: <Trans>Cancel</Trans>,
    disableButton: true,
  }
}

export function ConfirmButton({
  trade,
  slippage,
  onConfirm,
  triggerImpactSpeedbump,
  allowance,
}: {
  trade: InterfaceTrade
  slippage: Slippage
  onConfirm: () => Promise<void>
  triggerImpactSpeedbump: () => boolean
  allowance: Allowance
}) {
  const { onSwapPriceUpdateAck, onSubmitSwapClick } = useAtomValue(swapEventHandlersAtom)
  const [ackTrade, setAckTrade] = useState(trade)
  const doesTradeDiffer = useMemo(
    () => Boolean(trade && ackTrade && tradeMeaningfullyDiffers(trade, ackTrade, slippage.allowed)),
    [ackTrade, trade, slippage]
  )
  const onSwap = useCallback(async () => {
    onSubmitSwapClick?.(trade)
    await onConfirm()
  }, [onConfirm, onSubmitSwapClick, trade])

  const { onStartSwapFlow, onCancel, currentState } = useReviewState(onSwap, allowance, doesTradeDiffer)

  // Used to determine specific message to render while in ALLOWANCE_PROMPTED state
  const [shouldRequestApproval, isApprovalLoading] = useMemo(
    () =>
      allowance.state === AllowanceState.REQUIRED
        ? [allowance.shouldRequestApproval, allowance.isApprovalLoading]
        : [false, false],
    [allowance]
  )

  const onAcknowledgeClick = useCallback(() => {
    onSwapPriceUpdateAck?.(ackTrade, trade)
    setAckTrade(trade)

    const wasInterrupted = triggerImpactSpeedbump()
    // Prevents immeadiate swap if price impact speedbump was triggered
    if (!wasInterrupted) onStartSwapFlow()
  }, [ackTrade, triggerImpactSpeedbump, onStartSwapFlow, onSwapPriceUpdateAck, trade])

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
      case ReviewState.ALLOWING:
        return isApprovalLoading || allowance.state === AllowanceState.ALLOWED
          ? [getApprovalLoadingAction()]
          : [getAllowancePendingAction(shouldRequestApproval, onCancel, trade.inputAmount.currency)]
      case ReviewState.ALLOWANCE_FAILED:
        return [
          getAllowanceFailedAction(shouldRequestApproval, onStartSwapFlow, trade.inputAmount.currency),
          'warningSoft',
        ]
      case ReviewState.REVIEWING:
        return doesTradeDiffer
          ? [
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
                children: <Trans>Swap</Trans>,
              },
            ]
          : []
    }
  }, [
    allowance.state,
    currentState,
    doesTradeDiffer,
    isApprovalLoading,
    onAcknowledgeClick,
    onCancel,
    onStartSwapFlow,
    shouldRequestApproval,
    slippage,
    trade,
  ])

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
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null)
  const width = useWindowWidth()
  const isPageCentered = useIsDialogPageCentered()

  const onAcknowledgeSpeedbump = useCallback(() => {
    setAckPriceImpact(true)
    setShowSpeedbump(false)
  }, [])

  const triggerImpactSpeedbump = useCallback((): boolean => {
    if (!showSpeedbump && !ackPriceImpact && props.impact?.warning === 'error') {
      setShowSpeedbump(true)
      return true
    }
    return false
  }, [ackPriceImpact, props.impact?.warning, showSpeedbump])

  useEffect(() => {
    if (showSpeedbump && props.impact?.warning !== 'error') {
      setShowSpeedbump(false)
    }
  }, [ackPriceImpact, props.impact, showSpeedbump])

  return (
    <Column
      style={{ minWidth: isPageCentered ? Math.min(MIN_PAGE_CENTERED_DIALOG_WIDTH, width) : 'auto', height: '100%' }}
      ref={setBoundary}
    >
      {showSpeedbump && props.impact ? (
        <SpeedBumpDialog onAcknowledge={onAcknowledgeSpeedbump}>
          {t`This transaction will result in a`}{' '}
          <PriceImpactText>{formatPriceImpact(props.impact?.percent)} </PriceImpactText>
          {t`price impact on the market price of this pool. Do you wish to continue? `}
        </SpeedBumpDialog>
      ) : (
        <PopoverBoundaryProvider value={boundary}>
          <Header title={<Trans>Review swap</Trans>} />
          <Body flex align="stretch">
            <Details {...props} />
          </Body>
          <ConfirmButton {...props} triggerImpactSpeedbump={triggerImpactSpeedbump} />
        </PopoverBoundaryProvider>
      )}
    </Column>
  )
}
