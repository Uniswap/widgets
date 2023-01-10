import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { getChainInfo, isSupportedChainId } from 'constants/chainInfo'
import { ArrowUpRight } from 'icons'
import styled from 'styled-components/macro'

import Column from './Column'
import ExternalLink from './ExternalLink'

const ContentWrapper = styled.div<{ backgroundColor: string }>`
  background: ${({ backgroundColor }) => backgroundColor};
  border-radius: 1.25em;
  display: flex;
  flex-direction: row;
  margin-top: 1em;
  overflow: hidden;
  position: relative;
  width: 100%;
`
const BridgeLink = styled(ExternalLink)<{ color: string }>`
  align-items: center;
  border-radius: 0.5em;
  color: ${({ color }) => color};
  display: flex;
  font-size: 1em;
  justify-content: space-between;
  padding: 0.75em;
  text-decoration: none;
  width: 100%;
`
const L2Icon = styled.img`
  height: 1.75em;
  margin-right: 0.75em;
  width: 1.75em;
`
const Header = styled.div`
  font-size: 1em;
  font-weight: 500;
  line-height: 1.5em;
`
const BodyText = styled.div`
  align-items: center;
  display: flex;
  font-size: 0.875em;
  font-weight: 400;
  justify-content: flex-start;
  line-height: 1.25em;
`

const StyledArrowUpRight = styled(ArrowUpRight)`
  height: 1.5em;
  margin-left: 0.75em;
  width: 1.5em;
`

export function BridgeBanner() {
  const { chainId } = useWeb3React()

  if (!isSupportedChainId(chainId)) return null

  const { label, logoUrl, bridge, color, backgroundColor } = getChainInfo(chainId)

  if (!bridge || !color || !backgroundColor) return null

  return (
    <ContentWrapper backgroundColor={backgroundColor}>
      <BridgeLink href={bridge} color={color}>
        <BodyText>
          <L2Icon src={logoUrl} />
          <Column>
            <Header>
              <Trans>{label} token bridge</Trans>
            </Header>
            <Trans>Deposit tokens to the {label} network.</Trans>
          </Column>
        </BodyText>
        <StyledArrowUpRight />
      </BridgeLink>
    </ContentWrapper>
  )
}
