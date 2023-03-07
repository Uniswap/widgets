import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { Link } from 'icons'
import { ReactNode, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Color } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

import ExternalLink from './ExternalLink'
import Row from './Row'

const StyledExternalLink = styled(ExternalLink)<{ color: Color }>`
  color: ${({ theme, color }) => theme[color]};
  text-decoration: none;
`

interface EtherscanLinkProps {
  type: ExplorerDataType
  data?: string
  color?: Color
  children: ReactNode
  showIcon?: boolean
}

export default function EtherscanLink({
  data,
  type,
  color = 'currentColor',
  children,
  showIcon = true,
}: EtherscanLinkProps) {
  const { chainId } = useWeb3React()
  const url = useMemo(
    () => data && getExplorerLink(chainId || SupportedChainId.MAINNET, data, type),
    [chainId, data, type]
  )

  return (
    <StyledExternalLink href={url} color={color} target="_blank">
      <Row gap={0.25}>
        {children}
        {url && showIcon && <Link />}
      </Row>
    </StyledExternalLink>
  )
}
