import { Trans } from '@lingui/macro'
import { Placement } from '@popperjs/core'
import { formatPriceImpact } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import Row from 'components/Row'
import Tooltip from 'components/Tooltip'
import { loadingCss } from 'css/loading'
import { PriceImpact as PriceImpactType } from 'hooks/usePriceImpact'
import { useIsWideWidget } from 'hooks/useWidgetWidth'
import { AlertTriangle, ChevronDown, ChevronUp, Gas, Icon, Info, LargeIcon, Spinner } from 'icons'
import { ReactNode, useCallback } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled, { css } from 'styled-components/macro'
import { Color, ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import Price from '../Price'
import RoutingDiagram from '../RoutingDiagram'

const Loading = styled.span`
  color: ${({ theme }) => theme.secondary};
  ${loadingCss};
`

const CaptionRow = styled(Row)<{ gap: number; shrink?: number }>`
  flex-shrink: ${({ shrink }) => shrink ?? 1};
  gap: ${({ gap }) => gap}em;
  height: 100%;
`

const expandIconCss = css`
  color: ${({ theme }) => theme.secondary};
  cursor: pointer;
  :hover {
    opacity: 0.6;
  }
`

const ExpandIcon = styled(ChevronDown)`
  ${expandIconCss}
`

const CollapseIcon = styled(ChevronUp)`
  ${expandIconCss}
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

interface GasEstimateProps {
  trade?: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
}

function Caption({ icon: Icon = AlertTriangle, caption, color = 'secondary', tooltip }: CaptionProps) {
  return (
    <CaptionRow gap={0.5} shrink={0}>
      {Icon == null ? null : tooltip ? (
        <Tooltip placement={tooltip?.placement ?? 'bottom'} icon={LargeIcon} iconProps={{ icon: Icon, color }}>
          {tooltip?.content}
        </Tooltip>
      ) : (
        <LargeIcon icon={Icon} color={color} />
      )}
      <ThemedText.Body2 color={color}>{caption}</ThemedText.Body2>
    </CaptionRow>
  )
}

function GasEstimate({ gasUseEstimateUSD, trade }: GasEstimateProps) {
  const isWideWidget = useIsWideWidget()
  if (gasUseEstimateUSD == null) {
    return null
  }
  // TODO(just-toby): use formatCurrencyAmount from conedison
  const displayEstimate = !gasUseEstimateUSD
    ? '-'
    : formatCurrencyAmount({ amount: gasUseEstimateUSD, isUsdPrice: true })
  return (
    <CaptionRow gap={0.25}>
      <>
        {trade ? (
          <Tooltip icon={Gas} placement="left" iconProps={{ color: 'secondary' }}>
            <RoutingDiagram trade={trade} gasUseEstimateUSD={gasUseEstimateUSD} />
          </Tooltip>
        ) : (
          <Gas color="secondary" />
        )}
        {isWideWidget && <ThemedText.Body2 color="secondary">{displayEstimate}</ThemedText.Body2>}
      </>
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

export function UnsupportedNetwork() {
  return <Caption caption={<Trans>Switch to a supported network to trade</Trans>} />
}

export function InsufficientBalance({ currency }: { currency: Currency }) {
  return (
    <Caption
      color="warning"
      caption={
        <Trans>
          You don{"'"}t have enough {currency?.symbol}
        </Trans>
      }
    />
  )
}

export function InsufficientLiquidity() {
  return (
    <Caption
      color="warning"
      caption={<Trans>Insufficient liquidity</Trans>}
      tooltip={{
        content: (
          <ThemedText.Caption>Not enough liquidity in pool to swap between these two tokens.</ThemedText.Caption>
        ),
        placement: 'right',
      }}
    />
  )
}

export function Error() {
  return <Caption caption={<Trans>Error fetching trade</Trans>} />
}

export function MissingInputs() {
  return <Caption icon={Info} caption={<Trans>Enter an amount</Trans>} />
}

export function LoadingTrade({ gasUseEstimateUSD, trade }: GasEstimateProps) {
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
      <GasEstimate gasUseEstimateUSD={gasUseEstimateUSD} trade={trade} />
    </>
  )
}

interface WrapProps {
  inputCurrency: Currency
  outputCurrency: Currency
}

export function Wrap({ inputCurrency, outputCurrency, gasUseEstimateUSD, trade }: WrapProps & GasEstimateProps) {
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

  return <Caption icon={Info} caption={<Text />} />
}

export interface TradeProps {
  trade: InterfaceTrade
  outputUSDC?: CurrencyAmount<Currency>
}

interface ExpandProps {
  expanded: boolean
  toggleExpanded: () => void
}

const Expander = ({ expanded, toggleExpanded }: ExpandProps) => {
  return expanded ? <CollapseIcon onClick={toggleExpanded} /> : <ExpandIcon onClick={toggleExpanded} />
}

export function Trade({
  trade,
  outputUSDC,
  gasUseEstimateUSD,
  expanded,
  toggleExpanded,
}: TradeProps & GasEstimateProps & ExpandProps) {
  return (
    <>
      <Caption icon={null} caption={<Price trade={trade} outputUSDC={outputUSDC} />} />
      <CaptionRow gap={0.75}>
        <GasEstimate gasUseEstimateUSD={gasUseEstimateUSD} trade={trade} />
        <Expander expanded={expanded} toggleExpanded={toggleExpanded} />
      </CaptionRow>
    </>
  )
}

interface PriceImpactProps {
  impact: PriceImpactType
}

export const PriceImpactWarningTooltipContent = () => (
  <ThemedText.Caption>
    There will be a large difference between your input and output values due to current liquidity.
  </ThemedText.Caption>
)

export function PriceImpact({ impact, expanded, toggleExpanded }: PriceImpactProps & ExpandProps) {
  return (
    <>
      <Caption
        icon={AlertTriangle}
        caption="High price impact"
        color={impact.warning}
        tooltip={{
          placement: 'right',
          content: <PriceImpactWarningTooltipContent />,
        }}
      />
      <CaptionRow gap={0.75}>
        <ThemedText.Body2 userSelect={false} color={impact.warning}>
          {formatPriceImpact(impact?.percent)}
        </ThemedText.Body2>
        <Expander expanded={expanded} toggleExpanded={toggleExpanded} />
      </CaptionRow>
    </>
  )
}
