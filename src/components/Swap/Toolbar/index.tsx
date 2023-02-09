import { t } from '@lingui/macro'
import { formatCurrencyAmount, formatPriceImpact, NumberType } from '@uniswap/conedison/format'
import Column from 'components/Column'
import Expando from 'components/Expando'
import { ChainError, useIsAmountPopulated, useSwapInfo } from 'hooks/swap'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { AlertTriangle, Info } from 'icons'
import { createContext, memo, PropsWithChildren, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'

import Row from '../../Row'
import SwapInputOutputEstimate from '../Summary/Estimate'
import * as Caption from './Caption'
import ToolbarOrderRouting from './ToolbarOrderRouting'
import ToolbarTradeSummary, { SummaryRowProps } from './ToolbarTradeSummary'

const StyledExpando = styled(Expando)`
  border: 1px solid ${({ theme }) => theme.outline};
  border-radius: ${({ theme }) => theme.borderRadius.small}em;
  overflow: hidden;
`

const COLLAPSED_TOOLBAR_HEIGHT_EM = 3

const ToolbarRow = styled(Row)<{ isExpandable?: true }>`
  cursor: ${({ isExpandable }) => isExpandable && 'pointer'};
  flex-wrap: nowrap;
  gap: 0.5em;
  height: ${COLLAPSED_TOOLBAR_HEIGHT_EM}em;
  padding: 0 1em;
`

const Context = createContext<{
  open: boolean
  collapse: () => void
  onToggleOpen: () => void
}>({
  open: false,
  collapse: () => null,
  onToggleOpen: () => null,
})

export const Provider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false)
  const onToggleOpen = () => setOpen((open) => !open)
  const collapse = () => setOpen(false)
  return <Context.Provider value={{ open, onToggleOpen, collapse }}>{children}</Context.Provider>
}

export function useCollapseToolbar() {
  const { collapse } = useContext(Context)
  return collapse
}

export default memo(function Toolbar() {
  const {
    [Field.INPUT]: { currency: inputCurrency, balance: inputBalance, amount: inputAmount },
    [Field.OUTPUT]: { currency: outputCurrency, usdc: outputUSDC },
    error,
    trade: { trade, state, gasUseEstimateUSD },
    impact,
    slippage,
  } = useSwapInfo()
  const isAmountPopulated = useIsAmountPopulated()
  const isWrap = useIsWrap()
  const { open, onToggleOpen } = useContext(Context)

  const insufficientBalance: boolean | undefined = useMemo(() => {
    return inputBalance && inputAmount && inputBalance.lessThan(inputAmount)
  }, [inputAmount, inputBalance])

  const { caption, isExpandable } = useMemo((): { caption: ReactNode; isExpandable?: true } => {
    switch (error) {
      case ChainError.ACTIVATING_CHAIN:
        return { caption: <Caption.Connecting /> }
      case ChainError.UNSUPPORTED_CHAIN:
        return { caption: <Caption.UnsupportedNetwork /> }
      case ChainError.MISMATCHED_TOKEN_CHAINS:
        return { caption: <Caption.Error /> }
      default:
    }

    if (state === TradeState.LOADING) {
      return { caption: <Caption.LoadingTrade gasUseEstimateUSD={gasUseEstimateUSD} /> }
    }

    if (inputCurrency && outputCurrency && isAmountPopulated) {
      if (insufficientBalance) {
        return { caption: <Caption.InsufficientBalance currency={inputCurrency} /> }
      }
      if (isWrap) {
        return { caption: <Caption.Wrap inputCurrency={inputCurrency} outputCurrency={outputCurrency} /> }
      }
      if (state === TradeState.NO_ROUTE_FOUND || (trade && !trade.swaps)) {
        return { caption: <Caption.InsufficientLiquidity /> }
      }
      if (trade?.inputAmount && trade.outputAmount) {
        const caption = (
          <Caption.Trade
            trade={trade}
            outputUSDC={outputUSDC}
            gasUseEstimateUSD={open ? null : gasUseEstimateUSD}
            expanded={open}
          />
        )
        return { caption, isExpandable: true }
      }
      if (state === TradeState.INVALID) {
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
    insufficientBalance,
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
        value: impact?.percent ? formatPriceImpact(impact?.percent) : '-',
        valueTooltip: impact?.warning
          ? {
              icon: AlertTriangle,
              content: <Caption.PriceImpactWarningTooltipContent />,
            }
          : undefined,
      },
      {
        name: t`Minimum output after slippage`,
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
  }, [gasUseEstimateUSD, impact?.percent, impact?.warning, slippage, trade])

  if (inputCurrency == null || outputCurrency == null || error === ChainError.MISMATCHED_CHAINS) {
    return null
  }

  return (
    <StyledExpando
      title={
        <ToolbarRow
          flex
          justify="space-between"
          data-testid="toolbar"
          onClick={maybeToggleOpen}
          isExpandable={isExpandable}
        >
          {caption}
        </ToolbarRow>
      }
      styledTitleWrapper={false}
      showBottomGradient={false}
      open={open}
      onExpand={maybeToggleOpen}
      maxHeight={16}
    >
      <Column>
        <ToolbarTradeSummary rows={tradeSummaryRows} />
        <ToolbarOrderRouting trade={trade} />
      </Column>
    </StyledExpando>
  )
})
