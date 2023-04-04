import { Trans } from '@lingui/macro'
import { ReactComponent as DotLine } from 'assets/svg/dot_line.svg'
import Row from 'components/Row'
import { useChainTokenMapContext } from 'hooks/useTokenList'
import { NATIVE_ADDRESS, TokenListItem } from 'hooks/useTokenList/utils'
import { ChevronRight, HelpCircle } from 'icons'
import React, { ComponentProps, forwardRef, useState } from 'react'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import styled from 'styled-components/macro'
import { Layer, ThemedText } from 'theme'
import { Body2LineHeightRem } from 'theme/type'
import { ExplorerDataType } from 'utils/getExplorerLink'
import { Step, ZERO_ADDRESS } from 'wido'

import { IconButton } from './Button'
import Column from './Column'
import EtherscanLink from './EtherscanLink'
import Popover from './Popover'
import TokenImg from './TokenImg'
import { useTooltip } from './Tooltip'

export const RouteSummary = styled(ThemedText.Body2)`
  align-items: center;
  color: ${({ theme, color }) => color ?? theme.primary};
  display: flex;
`

export const ForwardedRow = forwardRef<HTMLDivElement, ComponentProps<typeof Row>>(function ForwardedRow(props, ref) {
  return <Row ref={ref} {...props} />
})

const RouteNode = styled(Row)`
  background-color: ${({ theme }) => theme.interactive};
  border-radius: ${({ theme }) => `${(theme.borderRadius.medium ?? 1) * 0.5}em`};
  margin: 0 1em;
  padding: 0.25em 0.375em;
  width: max-content;
`
// const RouteBadge = styled.div`
//   background-color: ${({ theme }) => theme.module};
//   border-radius: ${({ theme }) => `${(theme.borderRadius.medium ?? 1) * 0.25}em`};
//   padding: 0.125em;
// `

const Dots = styled(DotLine)`
  color: ${({ theme }) => theme.outline};
  position: absolute;
  z-index: ${Layer.UNDERLAYER};
`

const ExpandButton = styled(IconButton)`
  margin-left: 0.5em;
`

const CONTAINER_VERTICAL_PADDING_EM = 1
export const ORDER_ROUTING_HEIGHT_EM = CONTAINER_VERTICAL_PADDING_EM * 2 + Body2LineHeightRem /* Body2 line height */

const OrderRoutingRow = styled(Row)`
  height: ${ORDER_ROUTING_HEIGHT_EM}em;
  margin: 0 1em;
  padding: ${CONTAINER_VERTICAL_PADDING_EM}em 0;
`
const TokenInfoContainer = styled(Column)`
  margin-top: 1rem;
`

export function getToken(chainTokenMap: any, chainId: any, address: any): TokenListItem {
  const actualAddress = address === ZERO_ADDRESS ? NATIVE_ADDRESS : address
  return chainTokenMap[chainId][actualAddress].token
}

export function RouteBreakdown(props: { steps: Step[] }) {
  const { steps } = props

  const chainTokenMap = useChainTokenMapContext()
  const [tooltip, setTooltip] = useState<HTMLDivElement | null>(null)
  const showTooltip = useTooltip(tooltip)

  return (
    <OrderRoutingRow flex>
      <ThemedText.Body2 color="secondary">
        <Trans>Route preview</Trans>
      </ThemedText.Body2>
      <Popover
        content={
          <Row align="center" style={{ position: 'relative' }}>
            {steps.map((step, index) => {
              return (
                <React.Fragment key={index}>
                  {index === 0 && (
                    <TokenInfoContainer flex>
                      <TokenImg size={2} token={getToken(chainTokenMap, step.chainId, step.fromToken)} />
                      <ThemedText.Caption>
                        {getToken(chainTokenMap, step.chainId, step.fromToken).symbol}
                      </ThemedText.Caption>
                    </TokenInfoContainer>
                  )}
                  <Dots />
                  <RouteNode>
                    <Row gap={0.375}>
                      <ThemedText.Caption>{step.protocol}</ThemedText.Caption>
                      {/* <RouteBadge>
                          <ThemedText.Badge color="secondary">{step.functionName}</ThemedText.Badge>
                        </RouteBadge> */}
                    </Row>
                  </RouteNode>
                  <TokenInfoContainer flex>
                    <TokenImg size={2} token={getToken(chainTokenMap, step.toChainId, step.toToken)} />
                    <ThemedText.Caption>
                      {getToken(chainTokenMap, step.toChainId, step.toToken).symbol}
                    </ThemedText.Caption>
                  </TokenInfoContainer>
                </React.Fragment>
              )
            })}
          </Row>
        }
        show={showTooltip}
        placement="bottom"
        offset={12}
      >
        <ForwardedRow ref={setTooltip}>
          <RouteSummary>
            {steps.map((step, index) => {
              const fromToken = getToken(chainTokenMap, step.chainId, step.fromToken)
              const toToken = getToken(chainTokenMap, step.toChainId, step.toToken)

              return (
                <React.Fragment key={index}>
                  {index === 0 && (
                    <EtherscanLink
                      type={ExplorerDataType.TOKEN}
                      data={(fromToken as WrappedTokenInfo).address}
                      showIcon={true}
                      chainIdOverride={fromToken.chainId}
                    >
                      {fromToken.symbol}
                    </EtherscanLink>
                  )}
                  <ChevronRight />
                  <EtherscanLink
                    type={ExplorerDataType.TOKEN}
                    data={(toToken as WrappedTokenInfo).address}
                    showIcon={true}
                    chainIdOverride={toToken.chainId}
                  >
                    {toToken.symbol}
                  </EtherscanLink>
                </React.Fragment>
              )
            })}
            {/* <ExpandButton
                  color="secondary"
                  icon={expanded ? Minimize : Maximize}
                  iconProps={{}}
                /> */}
            <ExpandButton color="secondary" icon={HelpCircle} iconProps={{}} />
          </RouteSummary>
        </ForwardedRow>
      </Popover>
    </OrderRoutingRow>
  )
}
