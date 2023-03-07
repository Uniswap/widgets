import { t, Trans } from '@lingui/macro'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import ActionButton from 'components/ActionButton'
import Column from 'components/Column'
import Expando from 'components/Expando'
import { ChainError, useIsAmountPopulated, useSwapInfo } from 'hooks/swap'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { AlertTriangle, Info } from 'icons'
import { memo, ReactNode, useCallback, useContext, useMemo } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Row from '../../Row'
import SwapInputOutputEstimate from '../Summary/Estimate'
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
            />
          ),
          isExpandable: true,
        }
      }

      if (state === TradeState.INVALID || state === TradeState.NO_ROUTE_FOUND) {
        return { caption: <Caption.Error /> }
      }
    }

    return { caption: <Caption.MissingInputs /> }
  }, [
    error,
    state,
    inputCurrency,
    outputCurrency,
    isAmountPopulated,
    gasUseEstimateUSD,
    isWrap,
    trade,
    open,
    outputUSDC,
  ])

  const maybeToggleOpen = useCallback(() => {
    if (isExpandable) {
      onToggleOpen()
    }
  }, [isExpandable, onToggleOpen])

  const tradeSummaryRows: SummaryRowProps[] = useMemo(() => {
    const currencySymbol = trade?.outputAmount?.currency.symbol ?? ''
    const rows: SummaryRowProps[] = [
      {
        name: t`Network fee`,
        value: gasUseEstimateUSD ? `~${formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)}` : '-',
      },
      {
        color: impact?.warning,
        name: t`Price impact`,
        value: impact?.percent ? impact?.toString() : '-',
        valueTooltip: impact?.warning
          ? {
              icon: AlertTriangle,
              content: <Caption.PriceImpactWarningTooltipContent />,
            }
          : undefined,
      },
      {
        name: (
          <ThemedText.Body2 marginRight="0.25rem">
            <Trans>Minimum output after slippage </Trans>
            <ThemedText.Body2 $inline color={impact?.warning ?? 'secondary'}>
              {' '}
              ({impact?.toString()})
            </ThemedText.Body2>
          </ThemedText.Body2>
        ),
        value: trade ? `${formatCurrencyAmount(trade?.minimumAmountOut(slippage.allowed))} ${currencySymbol}` : '-',
      },
      {
        name: t`Expected output`,
        value: trade ? `${formatCurrencyAmount(trade?.outputAmount)} ${currencySymbol}` : '-',
        nameTooltip: trade
          ? {
              icon: Info,
              content: <SwapInputOutputEstimate trade={trade} slippage={slippage} />,
            }
          : undefined,
      },
    ]
    return rows
  }, [gasUseEstimateUSD, impact, slippage, trade])

  if (inputCurrency == null || outputCurrency == null || error === ChainError.MISMATCHED_CHAINS) {
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
