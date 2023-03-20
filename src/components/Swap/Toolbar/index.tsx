import { t, Trans } from '@lingui/macro'
import { formatCurrencyAmount, formatPriceImpact, NumberType } from '@uniswap/conedison/format'
import ActionButton from 'components/ActionButton'
import Column from 'components/Column'
import Expando from 'components/Expando'
import { ChainError, useIsAmountPopulated, useSwapInfo } from 'hooks/swap'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { AlertTriangle } from 'icons'
import { memo, ReactNode, useCallback, useContext, useMemo } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'

import Row from '../../Row'
import { getEstimateMessage } from '../Summary/Estimate'
import SwapActionButton from '../SwapActionButton'
import * as Caption from './Caption'
import { Context as ToolbarContext, Provider as ToolbarContextProvider } from './ToolbarContext'
import ToolbarOrderRouting from './ToolbarOrderRouting'
import ToolbarTradeSummary, { SummaryRowProps } from './ToolbarTradeSummary'

const StyledExpando = styled(Expando)`
  border: 1px solid ${({ theme }) => theme.outline};
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  overflow: hidden;
`

const COLLAPSED_TOOLBAR_HEIGHT_REM = 3

const ToolbarRow = styled(Row)<{ isExpandable?: true }>`
  cursor: ${({ isExpandable }) => isExpandable && 'pointer'};
  flex-wrap: nowrap;
  gap: 0.5rem;
  height: ${COLLAPSED_TOOLBAR_HEIGHT_REM}rem;
  padding: 0 1rem;
`

function CaptionRow() {
  const {
    [Field.INPUT]: { currency: inputCurrency },
    [Field.OUTPUT]: { currency: outputCurrency, usdc: outputUSDC },
    error,
    trade: { trade, state, gasUseEstimateUSD },
    impact,
    slippage,
  } = useSwapInfo()
  const isAmountPopulated = useIsAmountPopulated()
  const isWrap = useIsWrap()
  const { open, onToggleOpen } = useContext(ToolbarContext)

  const { caption, isExpandable } = useMemo((): { caption: ReactNode; isExpandable?: true } => {
    switch (error) {
      case ChainError.ACTIVATING_CHAIN:
        return { caption: <Caption.Connecting /> }
      case ChainError.MISMATCHED_TOKEN_CHAINS:
        return { caption: <Caption.Error /> }
      default:
    }

    if (state === TradeState.LOADING && !trade) {
      return { caption: <Caption.LoadingTrade gasUseEstimateUSD={gasUseEstimateUSD} /> }
    }

    if (inputCurrency && outputCurrency && isAmountPopulated) {
      if (isWrap) {
        return {
          caption: <Caption.Wrap inputCurrency={inputCurrency} outputCurrency={outputCurrency} />,
        }
      }

      if (trade) {
        return {
          caption: (
            <Caption.Trade
              trade={trade}
              outputUSDC={outputUSDC}
              gasUseEstimateUSD={open ? null : gasUseEstimateUSD}
              expanded={open}
              loading={state === TradeState.LOADING}
              warning={impact?.warning}
            />
          ),
          isExpandable: true,
        }
      }

      if (state === TradeState.INVALID) {
        return { caption: <Caption.Error /> }
      }
      if (state === TradeState.NO_ROUTE_FOUND) {
        return { caption: null }
      }
    }

    return { caption: <Caption.MissingInputs /> }
  }, [
    error,
    state,
    trade,
    inputCurrency,
    outputCurrency,
    isAmountPopulated,
    gasUseEstimateUSD,
    isWrap,
    outputUSDC,
    open,
    impact?.warning,
  ])

  const maybeToggleOpen = useCallback(() => {
    if (isExpandable) {
      onToggleOpen()
    }
  }, [isExpandable, onToggleOpen])

  const tradeSummaryRows: SummaryRowProps[] = useMemo(() => {
    const currencySymbol = trade?.outputAmount?.currency.symbol ?? ''
    const { descriptor, value, estimateMessage } = getEstimateMessage(trade, slippage)
    const rows: SummaryRowProps[] = [
      {
        name: t`Network fee`,
        nameTooltip: { content: t`The fee paid to miners to process your transaction. This must be paid in ETH.` },
        value: gasUseEstimateUSD ? `~${formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)}` : '-',
      },
      {
        color: impact?.warning,
        name: t`Price impact`,
        nameTooltip: { content: t`The impact your trade has on the market price of this pool.` },
        value: impact?.percent ? formatPriceImpact(impact.percent) : '-',
        valueTooltip: impact?.warning
          ? {
              icon: AlertTriangle,
              content: <Caption.PriceImpactWarningTooltipContent />,
            }
          : undefined,
      },
      {
        // min/max output/input after slippage
        name: <div style={{ marginRight: '0.5em' }}>{descriptor}</div>,
        value,
        nameTooltip: { content: estimateMessage },
      },
      {
        name: t`Expected output`,
        value: trade ? `${formatCurrencyAmount(trade?.outputAmount)} ${currencySymbol}` : '-',
        nameTooltip: trade
          ? {
              content: t`The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending.`,
            }
          : undefined,
      },
    ]
    return rows
  }, [gasUseEstimateUSD, impact, slippage, trade])

  if (inputCurrency == null || outputCurrency == null || error === ChainError.MISMATCHED_CHAINS || caption === null) {
    return null
  }
  return (
    <StyledExpando
      title={
        <ToolbarRow
          flex
          align="center"
          justify="space-between"
          data-testid="toolbar"
          onClick={maybeToggleOpen}
          isExpandable={isExpandable}
        >
          {caption}
        </ToolbarRow>
      }
      styledWrapper={false}
      open={open}
      onExpand={maybeToggleOpen}
      maxHeight={16}
    >
      <Column>
        <ToolbarTradeSummary rows={tradeSummaryRows} />
        <ToolbarOrderRouting trade={trade} gasUseEstimateUSD={gasUseEstimateUSD} />
      </Column>
    </StyledExpando>
  )
}

function ToolbarActionButton() {
  const {
    [Field.INPUT]: { currency: inputCurrency, balance: inputBalance, amount: inputAmount },
    [Field.OUTPUT]: { currency: outputCurrency },
    trade: { trade, state },
  } = useSwapInfo()
  const isAmountPopulated = useIsAmountPopulated()

  const insufficientBalance: boolean | undefined = useMemo(() => {
    return inputBalance && inputAmount && inputBalance.lessThan(inputAmount)
  }, [inputAmount, inputBalance])

  if (insufficientBalance) {
    return (
      <ActionButton disabled>
        <Trans>Insufficient {inputCurrency?.symbol} balance</Trans>
      </ActionButton>
    )
  }
  const hasValidInputs = inputCurrency && outputCurrency && isAmountPopulated
  if (hasValidInputs && (state === TradeState.NO_ROUTE_FOUND || (trade && !trade.swaps))) {
    return (
      <ActionButton disabled>
        <Trans>Insufficient liquidity</Trans>
      </ActionButton>
    )
  }
  return <SwapActionButton />
}

function Toolbar() {
  return (
    <>
      <CaptionRow />
      <ToolbarActionButton />
    </>
  )
}

export default memo(function WrappedToolbar() {
  return (
    <ToolbarContextProvider>
      <Toolbar />
    </ToolbarContextProvider>
  )
})
