import { Trans } from '@lingui/macro'
import { Placement } from '@popperjs/core'
import { formatCurrencyAmount, formatPriceImpact, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { BottomSheetModal } from 'components/BottomSheetModal'
import { IconButton } from 'components/Button'
import Column from 'components/Column'
import Row from 'components/Row'
import Tooltip from 'components/Tooltip'
import { loadingCss } from 'css/loading'
import { useIsMobileWidth } from 'hooks/useIsMobileWidth'
import { PriceImpact as PriceImpactType } from 'hooks/usePriceImpact'
import { useIsWideWidget } from 'hooks/useWidgetWidth'
import { AlertTriangle, ChevronDown, Gas, Icon, Info, LargeIcon, Spinner } from 'icons'
import { ReactNode, useCallback, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { AnimationSpeed, Color, ThemedText } from 'theme'

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

interface TradeTooltip {
  trade?: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
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

function GasEstimate({ gasUseEstimateUSD, trade }: TradeTooltip) {
  const isWideWidget = useIsWideWidget()
  const isMobile = useIsMobileWidth()
  const [open, setOpen] = useState(false)
  if (gasUseEstimateUSD === null) {
    return null
  }
  const displayEstimate = formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)
  return (
    <CaptionRow gap={0.25}>
      <>
        {trade ? (
          isMobile ? (
            <>
              <IconButton onClick={() => setOpen(!open)} icon={Gas} iconProps={{ color: 'secondary' }} />
              <BottomSheetModal title="Route details" onClose={() => setOpen(false)} open={open}>
                <Column padded>
                  <RoutingDiagram trade={trade} hideHeader />
                </Column>
              </BottomSheetModal>
            </>
          ) : (
            <Tooltip icon={Gas} placement="left" iconProps={{ color: 'secondary' }}>
              <RoutingDiagram trade={trade} />
            </Tooltip>
          )
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
  return <Caption icon={AlertTriangle} caption={<Trans>Switch to a supported network to trade</Trans>} />
}

export function InsufficientBalance({ currency }: { currency: Currency }) {
  return (
    <Caption
      color="warning"
      icon={AlertTriangle}
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
      icon={AlertTriangle}
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
      <GasEstimate gasUseEstimateUSD={gasUseEstimateUSD} />
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

  return <Caption icon={Info} caption={<Text />} />
}

export interface TradeProps {
  trade: InterfaceTrade
  outputUSDC?: CurrencyAmount<Currency>
}

interface ExpandProps {
  expanded: boolean
  onToggleExpand: () => void
}

const Expander = ({ expanded, onToggleExpand }: ExpandProps) => {
  return <ExpandIcon onClick={onToggleExpand} $expanded={expanded} />
}

export function Trade({
  trade,
  outputUSDC,
  gasUseEstimateUSD,
  expanded,
  onToggleExpand,
}: TradeProps & TradeTooltip & ExpandProps) {
  return (
    <>
      <Caption caption={<Price trade={trade} outputUSDC={outputUSDC} />} />
      <CaptionRow gap={0.75}>
        <GasEstimate gasUseEstimateUSD={gasUseEstimateUSD} trade={trade} />
        <Expander expanded={expanded} onToggleExpand={onToggleExpand} />
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

export function PriceImpact({ impact, expanded, onToggleExpand }: PriceImpactProps & ExpandProps) {
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
        <Expander expanded={expanded} onToggleExpand={onToggleExpand} />
      </CaptionRow>
    </>
  )
}
