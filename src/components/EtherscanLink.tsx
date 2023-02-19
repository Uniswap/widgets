import { SupportedChainId } from 'constants/chains'
import { useEvmChainId } from 'hooks/useSyncWidgetSettings'
import { Link } from 'icons'
import { ReactNode, useMemo } from 'react'
import styled from 'styled-components/macro'
import { Color } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

import ExternalLink from './ExternalLink'
import Row from './Row'

const StyledExternalLink = styled(ExternalLink)<{ color: Color }>`
  color: ${({ theme, color }) => theme[color]};
`

interface EtherscanLinkProps {
  type: ExplorerDataType
  data?: string
  color?: Color
  children: ReactNode
  showIcon?: boolean
  chainIdOverride?: number
}

export default function EtherscanLink({
  data,
  type,
  color = 'currentColor',
  children,
  showIcon = true,
  chainIdOverride,
}: EtherscanLinkProps) {
  const evmChainId = useEvmChainId()
  const chainId = chainIdOverride || evmChainId
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
