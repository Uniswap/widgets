import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { ReactComponent as GasIcon } from 'assets/svg/gasIcon.svg'
import Row from 'components/Row'
import { loadingCss } from 'css/loading'
import { PriceImpact } from 'hooks/usePriceImpact'
import { AlertTriangle, Icon, Info, InlineSpinner, LargeIcon } from 'icons'
import { ReactNode, useCallback } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'

import Price from '../Price'

const Loading = styled.span`
  color: ${({ theme }) => theme.secondary};
  ${loadingCss};
`

const CaptionRow = styled(Row)<{ gap?: number }>`
  gap: ${({ gap }) => gap ?? 0.5}em;
  height: 100%;
`

const GasIconWrapper = styled(GasIcon)`
  height: 1em;
  width: 1em;
`

interface CaptionProps {
  icon?: Icon
  caption: ReactNode
}

interface GasEstimateProp {
  gasUseEstimateUSD: CurrencyAmount<Token> | undefined
}

function Caption({ icon: Icon = AlertTriangle, caption }: CaptionProps) {
  return (
    <CaptionRow>
      <LargeIcon icon={Icon} color="secondary" />
      <ThemedText.Body2 color="secondary">{caption}</ThemedText.Body2>
    </CaptionRow>
  )
}

function GasEstimate({ gasUseEstimateUSD }: GasEstimateProp) {
  const theme = useTheme()

  return (
    <CaptionRow gap={0.25}>
      <GasIconWrapper color={theme.secondary} />
      <ThemedText.Body2 color="secondary">${gasUseEstimateUSD?.toFixed(2) ?? ' –'}</ThemedText.Body2>
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

export function LoadingTrade({ gasUseEstimateUSD }: GasEstimateProp) {
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

interface WrapCurrencyProps {
  inputCurrency: Currency
  outputCurrency: Currency
}

export function WrapCurrency({
  inputCurrency,
  outputCurrency,
  gasUseEstimateUSD,
}: WrapCurrencyProps & GasEstimateProp) {
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

export interface TradeProps {
  trade: InterfaceTrade
  outputUSDC?: CurrencyAmount<Currency>
  impact?: PriceImpact
}

export function Trade({ trade, outputUSDC, impact, gasUseEstimateUSD }: TradeProps & GasEstimateProp) {
  return (
    <>
      <CaptionRow>
        <Price trade={trade} outputUSDC={outputUSDC} />
      </CaptionRow>
      <GasEstimate gasUseEstimateUSD={gasUseEstimateUSD} />
    </>
  )
}
