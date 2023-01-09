import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import Column from 'components/Column'
import Row from 'components/Row'
import Rule from 'components/Rule'
import Tooltip from 'components/Tooltip'
import { loadingCss } from 'css/loading'
import { PriceImpact } from 'hooks/usePriceImpact'
import { AlertTriangle, Gas, Icon, Info, InlineSpinner, LargeIcon } from 'icons'
import { ReactNode, useCallback } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import Price from '../Price'
import RoutingDiagram from '../RoutingDiagram'

const Loading = styled.span`
  color: ${({ theme }) => theme.secondary};
  ${loadingCss};
`

const CaptionRow = styled(Row)<{ gap: number }>`
  gap: ${({ gap }) => gap}em;
  height: 100%;
`

interface CaptionProps {
  icon?: Icon
  caption: ReactNode
}

interface GasEstimateProps {
  gasUseEstimateUSD: CurrencyAmount<Token> | undefined
}

function Caption({ icon: Icon = AlertTriangle, caption }: CaptionProps) {
  return (
    <CaptionRow gap={0.5}>
      <LargeIcon icon={Icon} color="secondary" />
      <ThemedText.Body2 color="secondary">{caption}</ThemedText.Body2>
    </CaptionRow>
  )
}

function GasEstimate({ gasUseEstimateUSD }: GasEstimateProps) {
  return (
    <CaptionRow gap={0.25}>
      <Gas color="secondary" />
      <ThemedText.Body2 color="secondary">
        {formatCurrencyAmount({ amount: gasUseEstimateUSD, isUsdPrice: true })}
      </ThemedText.Body2>
    </CaptionRow>
  )
}

export function Connecting() {
  return (
    <Caption
      icon={InlineSpinner}
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
  return <Caption caption={<Trans>Insufficient {currency?.symbol} balance</Trans>} />
}

export function InsufficientLiquidity() {
  return <Caption caption={<Trans>Insufficient liquidity for your trade</Trans>} />
}

export function Error() {
  return <Caption caption={<Trans>Error fetching trade</Trans>} />
}

export function MissingInputs() {
  return <Caption icon={Info} caption={<Trans>Enter an amount</Trans>} />
}

export function LoadingTrade({ gasUseEstimateUSD }: GasEstimateProps) {
  return (
    <>
      <Caption
        icon={InlineSpinner}
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

interface WrapCurrencyProps extends GasEstimateProps {
  inputCurrency: Currency
  outputCurrency: Currency
}

export function WrapCurrency({ inputCurrency, outputCurrency, gasUseEstimateUSD }: WrapCurrencyProps) {
  const Text = useCallback(
    () => (
      <Trans>
        Convert {inputCurrency.symbol} to {outputCurrency.symbol} with no slippage
      </Trans>
    ),
    [inputCurrency.symbol, outputCurrency.symbol]
  )

  return (
    <>
      <Caption icon={Info} caption={<Text />} />
      <GasEstimate gasUseEstimateUSD={gasUseEstimateUSD} />
    </>
  )
}

export interface TradeProps extends GasEstimateProps {
  trade: InterfaceTrade
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
}

export function Trade({ trade, outputUSDC, impact, gasUseEstimateUSD }: TradeProps) {
  return (
    <>
      <CaptionRow gap={0.5}>
        <Tooltip placement="bottom" icon={LargeIcon} iconProps={{ icon: impact?.warning ? AlertTriangle : Info }}>
          <Column gap={0.75}>
            {impact?.warning && (
              <>
                <ThemedText.Caption>
                  The output amount is estimated at {impact.toString()} less than the input amount due to impact
                </ThemedText.Caption>
                <Rule />
              </>
            )}
            <RoutingDiagram trade={trade} />
          </Column>
        </Tooltip>
        <Price trade={trade} outputUSDC={outputUSDC} />
      </CaptionRow>
      <GasEstimate gasUseEstimateUSD={gasUseEstimateUSD} />
    </>
  )
}
