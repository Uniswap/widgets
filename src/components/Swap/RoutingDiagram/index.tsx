import { Trans } from '@lingui/macro'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { Protocol } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { ReactComponent as DotLine } from 'assets/svg/dot_line.svg'
import Column from 'components/Column'
import Row from 'components/Row'
import Rule from 'components/Rule'
import TokenImg from 'components/TokenImg'
import { AutoRouter } from 'icons'
import { ComponentProps, forwardRef, useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { Layer, ThemedText } from 'theme'

import { getTokenPath, RoutingDiagramEntry } from './utils'

const StyledAutoRouterLabel = styled(ThemedText.ButtonSmall)`
  @supports (-webkit-background-clip: text) and (-webkit-text-fill-color: transparent) {
    background-image: linear-gradient(90deg, #2172e5 0%, #54e521 163.16%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`

export const AutoRouterHeader = forwardRef<HTMLDivElement, ComponentProps<typeof Row>>(function AutoRouterHeader(
  props,
  ref
) {
  return (
    <Row justify="left" gap={0.25} ref={ref} {...props}>
      <AutoRouter />
      <StyledAutoRouterLabel color="primary" lineHeight={'16px'}>
        <ThemedText.Subhead2>
          <Trans>Auto Router</Trans>
        </ThemedText.Subhead2>
      </StyledAutoRouterLabel>
    </Row>
  )
})

const Dots = styled(DotLine)`
  color: ${({ theme }) => theme.outline};
  position: absolute;
  z-index: ${Layer.UNDERLAYER};
`

const RouteRow = styled(Row)`
  flex-wrap: nowrap;
  margin: 0 0.5rem;
  position: relative;
`

const GasEstimateRow = styled(Row)`
  border-top: 1px solid ${({ theme }) => theme.outline};
  max-width: 350px;
  padding: 0.5rem 0 0;
`

const RouteNode = styled(Row)`
  background-color: ${({ theme }) => theme.module};
  border-radius: ${({ theme }) => `${(theme.borderRadius.medium ?? 1) * 0.5}rem`};
  margin-left: 0.5rem;
  padding: 0.25rem;
  width: max-content;
`

const RouteBadge = styled.div`
  background-color: ${({ theme }) => theme.interactive};
  border-radius: ${({ theme }) => `${(theme.borderRadius.medium ?? 1) * 0.25}rem`};
  padding: 0.25rem;
`

function RouteDetail({ route }: { route: RoutingDiagramEntry }) {
  const protocol = route.protocol.toUpperCase()
  return (
    <RouteNode>
      <Row gap={0.375}>
        <RouteBadge>
          <ThemedText.Badge fontSize={'12px'} color="secondary">
            {protocol === Protocol.MIXED ? 'V3 + V2' : protocol}
          </ThemedText.Badge>
        </RouteBadge>
        <ThemedText.Caption>{route.percent.toSignificant(2)}%</ThemedText.Caption>
      </Row>
    </RouteNode>
  )
}

const RoutePool = styled(RouteNode)`
  margin: 0 0.75rem;
  padding: 0.25rem;
`

function Pool({
  originCurrency,
  targetCurrency,
  feeAmount,
}: {
  originCurrency: Currency
  targetCurrency: Currency
  feeAmount: FeeAmount
}) {
  return (
    <RoutePool>
      <Row gap={0.25}>
        <Row flex align="center">
          <TokenImg token={originCurrency} size={0.75} />
          <Row style={{ marginLeft: '-0.25rem' }} flex align="center">
            <TokenImg token={targetCurrency} size={0.75} />
          </Row>
        </Row>
        <ThemedText.Caption>{feeAmount / 10_000}%</ThemedText.Caption>
      </Row>
    </RoutePool>
  )
}

function Route({ route }: { route: RoutingDiagramEntry }) {
  const [originCurrency] = route.path[0]
  const [, targetCurrency] = route.path[route.path.length - 1]

  return (
    <Row align="center" justify="space-between" flex grow>
      <Row align="center" justify="flex-start" flex>
        <TokenImg token={originCurrency} />
        <RouteDetail route={route} />
      </Row>
      <RouteRow flex grow>
        <Dots />
        <RouteRow justify="space-around" flex grow>
          {route.path.map(([originCurrency, targetCurrency, feeAmount], index) => (
            <Pool key={index} originCurrency={originCurrency} targetCurrency={targetCurrency} feeAmount={feeAmount} />
          ))}
        </RouteRow>
      </RouteRow>
      <TokenImg token={targetCurrency} />
    </Row>
  )
}

export default function RoutingDiagram({
  trade,
  gasUseEstimateUSD,
  hideHeader,
}: {
  trade: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
  hideHeader?: boolean
}) {
  const routes: RoutingDiagramEntry[] = useMemo(() => getTokenPath(trade), [trade])

  return (
    <Column gap={0.75} padding="0.5rem">
      {!hideHeader && (
        <>
          <AutoRouterHeader />
          <Rule />
        </>
      )}
      {routes.map((route, index) => (
        <Route key={index} route={route} />
      ))}
      {gasUseEstimateUSD && (
        <GasEstimateRow>
          <ThemedText.Caption color="secondary">
            <Trans>
              Best price route costs {formatCurrencyAmount(gasUseEstimateUSD, NumberType.FiatGasPrice)} in gas. Your
              price is optimized by considering split routes, multiple hops, and gas costs.
            </Trans>
          </ThemedText.Caption>
        </GasEstimateRow>
      )}
    </Column>
  )
}
