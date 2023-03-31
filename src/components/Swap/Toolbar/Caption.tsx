import { Trans } from '@lingui/macro'
import { Placement } from '@popperjs/core'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import Row from 'components/Row'
import Tooltip from 'components/Tooltip'
import { loadingCss } from 'css/loading'
import { useIsWideWidget, useWidgetWidth } from 'hooks/useWidgetWidth'
import { AlertTriangle, ChevronDown, Icon, Info, LargeIcon, Spinner } from 'icons'
import { ReactNode, useCallback } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled, { css } from 'styled-components/macro'
import { AnimationSpeed, Color, ThemedText } from 'theme'
import { WIDGET_BREAKPOINTS } from 'theme/breakpoints'

import Price from '../Price'
import { GasEstimateTooltip, TradeTooltip } from './GasEstimateTooltip'

const Loading = styled.span`
  color: ${({ theme }) => theme.secondary};
  ${loadingCss};
`

const CaptionRow = styled(Row)<{ gap: number; shrink?: number }>`
  align-items: center;
  flex-shrink: ${({ shrink }) => shrink ?? 1};
  gap: ${({ gap }) => gap}rem;
  height: 100%;
`

// TODO (tina): consolidate this and Expando icon
const ExpandIcon = styled(ChevronDown)<{ $expanded: boolean }>`
  color: ${({ theme }) => theme.secondary};
  cursor: pointer;
  transform: ${({ $expanded }) => ($expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform ${AnimationSpeed.Medium};

  :hover {
    opacity: 0.6;
  }
`

interface CaptionTooltip {
  content: ReactNode
  placement?: Placement
}

interface CaptionProps {
  icon?: Icon | null
  caption: ReactNode
  color?: Color
  tooltip?: CaptionTooltip
}

function Caption({ icon: Icon, caption, color = 'secondary', tooltip }: CaptionProps) {
  return (
    <CaptionRow gap={0.5} shrink={0}>
      {tooltip ? (
        <Tooltip placement={tooltip?.placement ?? 'bottom'} icon={LargeIcon} iconProps={{ icon: Icon, color }}>
          {tooltip?.content}
        </Tooltip>
      ) : (
        Icon && <LargeIcon icon={Icon} color={color} />
      )}
      <ThemedText.Body2 color={color}>{caption}</ThemedText.Body2>
    </CaptionRow>
  )
}

export function Connecting() {
  return (
    <Caption
      icon={Spinner}
      caption={
        <Loading>
          <Trans>Connecting…</Trans>
        </Loading>
      }
    />
  )
}

export function Error() {
  return <Caption icon={AlertTriangle} caption={<Trans>Error fetching trade</Trans>} />
}

export function MissingInputs() {
  return <Caption icon={Info} caption={<Trans>Enter an amount</Trans>} />
}

export function LoadingTrade({ gasUseEstimateUSD }: TradeTooltip) {
  return (
    <>
      <Caption
        icon={Spinner}
        color="primary"
        caption={
          <Loading>
            <Trans>Fetching best price…</Trans>
          </Loading>
        }
      />
      <CaptionRow gap={0.25}>
        <GasEstimateTooltip gasUseEstimateUSD={gasUseEstimateUSD} />
      </CaptionRow>
    </>
  )
}

interface WrapProps {
  inputCurrency: Currency
  outputCurrency: Currency
}

export function Wrap({ inputCurrency, outputCurrency }: WrapProps) {
  const isWideWidget = useIsWideWidget()
  const Text = useCallback(
    () =>
      isWideWidget ? (
        <Trans>
          Convert {inputCurrency.symbol} to {outputCurrency.symbol} with no slippage
        </Trans>
      ) : (
        <Trans>
          Convert {inputCurrency.symbol} to {outputCurrency.symbol}
        </Trans>
      ),
    [inputCurrency.symbol, isWideWidget, outputCurrency.symbol]
  )

  return <Caption caption={<Text />} />
}

export interface TradeProps {
  trade: InterfaceTrade
  loading: boolean
  outputUSDC?: CurrencyAmount<Currency>
}

interface ExpandProps {
  expanded: boolean
  warning?: 'warning' | 'error'
}

const ExpanderRow = styled(Row)<{ $expanded: boolean; warning?: 'warning' | 'error' }>`
  ${({ warning, $expanded }) => {
    if (!warning) return undefined
    return css`
      background-color: ${({ theme }) =>
        $expanded ? 'transparent' : warning === 'error' ? theme.criticalSoft : theme.warningSoft};
      border-radius: ${({ theme }) => theme.borderRadius.xsmall}rem;
      padding: 0.375rem 0.5rem 0.375rem 0.375rem;
      transition: background-color ${AnimationSpeed.Medium} linear, padding ${AnimationSpeed.Medium} linear,
        width ${AnimationSpeed.Medium} linear;
    `
  }}
`

function Expander({ expanded, warning }: ExpandProps) {
  return (
    <ExpanderRow $expanded={expanded} warning={warning} gap={0.5}>
      {warning && !expanded && (
        <Tooltip icon={AlertTriangle} iconProps={{ color: warning }} placement="auto">
          <ThemedText.Caption>
            <Trans>Your trade will have a high impact on the market price of this pool.</Trans>
          </ThemedText.Caption>
        </Tooltip>
      )}
      <ExpandIcon $expanded={expanded} color={expanded ? undefined : warning} />
    </ExpanderRow>
  )
}

export function Trade({
  trade,
  outputUSDC,
  gasUseEstimateUSD,
  expanded,
  loading,
  warning,
}: TradeProps & TradeTooltip & ExpandProps) {
  const widgetWidth = useWidgetWidth()
  // The USD value doesn't fit in the widget at small sizes when we show the warning UI.
  const shouldHideUSD = widgetWidth < WIDGET_BREAKPOINTS.EXTRA_SMALL && warning && !expanded
  return (
    <>
      <Caption
        caption={
          <ThemedText.Body2 opacity={loading ? 0.4 : 1}>
            <Price trade={trade} outputUSDC={shouldHideUSD ? undefined : outputUSDC} />
          </ThemedText.Body2>
        }
        icon={loading ? Spinner : null}
      />
      {!loading && (
        <CaptionRow gap={0.75}>
          {!expanded && (
            <CaptionRow gap={0.25}>
              <GasEstimateTooltip gasUseEstimateUSD={gasUseEstimateUSD} trade={trade} />
            </CaptionRow>
          )}
          <Expander expanded={expanded} warning={warning} />
        </CaptionRow>
      )}
    </>
  )
}

export function PriceImpactWarningTooltipContent() {
  return (
    <ThemedText.Caption>
      There will be a large difference between your input and output values due to current liquidity.
    </ThemedText.Caption>
  )
}
