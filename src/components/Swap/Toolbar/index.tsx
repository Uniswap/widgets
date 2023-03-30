import { t } from '@lingui/macro'
import { formatCurrencyAmount, formatPriceImpact } from '@uniswap/conedison/format'
import Column from 'components/Column'
import Expando from 'components/Expando'
import { RouteBreakdown } from 'components/RouteBreakdown'
import { ChainError, useIsAmountPopulated, useSwapInfo } from 'hooks/swap'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { useEvmAccountAddress, useSnAccountAddress } from 'hooks/useSyncWidgetSettings'
import { AlertTriangle, Info } from 'icons'
import { createContext, memo, PropsWithChildren, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { TradeState } from 'state/routing/types'
import { calcMinimumAmountOut } from 'state/routing/utils'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { isStarknetChain } from 'utils/starknet'

import Row from '../../Row'
import SwapInputOutputEstimate from '../Summary/Estimate'
import ApproveButton from '../SwapActionButton/ApproveButton'
import * as Caption from './Caption'
import ToolbarTradeSummary, { SummaryRowProps } from './ToolbarTradeSummary'

const StyledExpando = styled(Expando)`
  border: 1px solid ${({ theme }) => theme.outline};
  border-radius: ${({ theme }) => theme.borderRadius.small}em;
  overflow: hidden;
`

const COLLAPSED_TOOLBAR_HEIGHT_EM = 3.5

const ToolbarRow = styled(Row)<{ isExpandable?: true }>`
  cursor: ${({ isExpandable }) => isExpandable && 'pointer'};
  flex-wrap: nowrap;
  gap: 0.5em;
  height: ${COLLAPSED_TOOLBAR_HEIGHT_EM}em;
  padding: 0.75em;
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
    approval,
    trade: { trade, state, gasUseEstimateUSD },
    impact,
    slippage,
  } = useSwapInfo()
  const isAmountPopulated = useIsAmountPopulated()
  const isWrap = useIsWrap()
  const { open, onToggleOpen } = useContext(Context)

  const account = useEvmAccountAddress()
  const snAccount = useSnAccountAddress()

  const srcWalletConnected = isStarknetChain(inputCurrency?.chainId) ? snAccount : account
  const dstWalletConnected = isStarknetChain(outputCurrency?.chainId) ? snAccount : account
  const walletsConnected = srcWalletConnected && dstWalletConnected

  const insufficientBalance: boolean | undefined = useMemo(() => {
    return inputBalance && inputAmount && inputBalance.lessThan(inputAmount)
  }, [inputAmount, inputBalance])

  const { caption, isExpandable } = useMemo((): { caption: ReactNode; isExpandable?: true } => {
    if (state === TradeState.LOADING) {
      return { caption: <Caption.LoadingTrade gasUseEstimateUSD={gasUseEstimateUSD} /> }
    }

    if (inputCurrency && outputCurrency && isAmountPopulated) {
      if (isWrap) {
        return { caption: <Caption.Wrap inputCurrency={inputCurrency} outputCurrency={outputCurrency} /> }
      }
      if (state === TradeState.NO_ROUTE_FOUND) {
        return { caption: <Caption.InsufficientLiquidity /> }
      }
      if (trade?.inputAmount && trade.outputAmount) {
        const caption = impact?.warning ? (
          <Caption.PriceImpact impact={impact} expanded={open} />
        ) : (
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
        if (!walletsConnected && error) {
          return { caption: <Caption.Caption color="warning" icon={AlertTriangle} caption={error} /> }
        } else {
          return { caption: <Caption.Error /> }
        }
      }
    }

    return { caption: null }
  }, [
    walletsConnected,
    state,
    error,
    inputCurrency,
    outputCurrency,
    isAmountPopulated,
    gasUseEstimateUSD,
    isWrap,
    trade,
    impact,
    open,
    outputUSDC,
  ])

  const { caption: walletErrorCaption } = useMemo((): { caption: ReactNode; isExpandable?: true } => {
    switch (error) {
      case ChainError.ACTIVATING_CHAIN:
        return { caption: <Caption.Connecting /> }
      case ChainError.UNSUPPORTED_CHAIN:
        return { caption: <Caption.UnsupportedNetwork /> }
      case ChainError.MISMATCHED_CHAINS:
        return { caption: null }
      default:
    }
    if (error) {
      return { caption: <Caption.Caption color="warning" icon={AlertTriangle} caption={error} /> }
    }

    if (inputCurrency && outputCurrency && isAmountPopulated) {
      if (insufficientBalance) {
        return { caption: <Caption.InsufficientBalance currency={inputCurrency} /> }
      }
    }

    return { caption: null }
  }, [error, inputCurrency, outputCurrency, isAmountPopulated, insufficientBalance])

  const maybeToggleOpen = useCallback(() => {
    if (isExpandable) {
      onToggleOpen()
    }
  }, [isExpandable, onToggleOpen])

  const tradeSummaryRows: SummaryRowProps[] = useMemo(() => {
    const currencySymbol = trade?.outputAmount?.currency.symbol ?? ''
    const rows: SummaryRowProps[] = [
      // {
      //   name: t`Network fee`,
      //   value: gasUseEstimateUSD ? `~${formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)}` : '-',
      // },
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
        value: trade
          ? `${formatCurrencyAmount(calcMinimumAmountOut(slippage.allowed, trade?.outputAmount))} ${currencySymbol}`
          : '-',
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
  }, [impact?.percent, impact?.warning, slippage, trade])

  if (inputCurrency == null || outputCurrency == null || !isAmountPopulated) {
    return null
  }

  let approveButton = null
  if (!insufficientBalance) {
    if (approval.state !== SwapApprovalState.APPROVED) {
      approveButton = <ApproveButton trade={trade} {...approval} />
    }
  }

  return (
    <Column gap={approveButton ? 0 : 0.5}>
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
          {trade && <RouteBreakdown steps={trade.steps} />}
        </Column>
      </StyledExpando>
      {approveButton && approveButton}
      {walletsConnected && walletErrorCaption && !approveButton && (
        <StyledExpando
          title={
            <ToolbarRow flex justify="space-between" data-testid="error-toolbar">
              {walletErrorCaption}
            </ToolbarRow>
          }
          styledTitleWrapper={false}
          showBottomGradient={false}
          open={false}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onExpand={() => {}}
          maxHeight={18}
        >
          <div />
        </StyledExpando>
      )}
      {trade &&
        trade.messages.length > 0 &&
        trade.messages.map(({ type, message }, index) => (
          <StyledExpando
            key={index}
            padded
            title={
              <Caption.Caption
                color={type === 'warning' ? 'warning' : undefined}
                icon={type === 'warning' ? AlertTriangle : Info}
                caption={message}
              />
            }
            styledTitleWrapper={false}
            showBottomGradient={false}
            open={false}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onExpand={() => {}}
          >
            <div />
          </StyledExpando>
        ))}
    </Column>
  )
})
