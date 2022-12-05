import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import Column from 'components/Column'
import Rule from 'components/Rule'
import Tooltip from 'components/Tooltip'
import { loadingCss } from 'css/loading'
import { PriceImpact } from 'hooks/usePriceImpact'
import { AlertTriangle, Icon, Info, InlineSpinner, LargeIcon } from 'icons'
import { ReactNode, useCallback } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Price from '../Price'
import RoutingDiagram from '../RoutingDiagram'

const Loading = styled.span`
  color: ${({ theme }) => theme.secondary};
  ${loadingCss};
`

interface CaptionProps {
  icon?: Icon
  caption: ReactNode
}

function Caption({ icon: Icon = AlertTriangle, caption }: CaptionProps) {
  return (
    <>
      <LargeIcon icon={Icon} color="secondary" />
      <ThemedText.Body2 color="secondary" lineHeight="16px">
        {caption}
      </ThemedText.Body2>
    </>
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

export function ConnectWallet() {
  return <Caption caption={<Trans>Connect wallet to swap</Trans>} />
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

export function LoadingTrade() {
  return (
    <Caption
      icon={InlineSpinner}
      caption={
        <Loading>
          <Trans>Fetching best price…</Trans>
        </Loading>
      }
    />
  )
}

export function WrapCurrency({ inputCurrency, outputCurrency }: { inputCurrency: Currency; outputCurrency: Currency }) {
  const Text = useCallback(
    () => (
      <Trans>
        Convert {inputCurrency.symbol} to {outputCurrency.symbol}
      </Trans>
    ),
    [inputCurrency.symbol, outputCurrency.symbol]
  )

  return <Caption icon={Info} caption={<Text />} />
}

export function Trade({
  trade,
  outputUSDC,
  impact,
}: {
  trade: InterfaceTrade
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
}) {
  return (
    <>
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
    </>
  )
}
