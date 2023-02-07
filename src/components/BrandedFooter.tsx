import { Trans } from '@lingui/macro'
import Row from 'components/Row'
import { Logo } from 'icons'
import { memo } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import ExternalLink from './ExternalLink'

const UniswapA = styled(ExternalLink)`
  color: ${({ theme }) => theme.secondary};
  cursor: pointer;
  text-decoration: none;

  ${Logo} {
    height: 1em;
    width: 1em;
  }
`
const Wrapper = styled(Row)`
  margin-top: 12px;
`

export default memo(function BrandedFooter() {
  return (
    <Wrapper justify="center">
      <UniswapA href={`https://joinwido.com`}>
        <Row gap={0.25}>
          <Logo />
          <ThemedText.Caption>
            <Trans>Powered by Wido</Trans>
          </ThemedText.Caption>
        </Row>
      </UniswapA>
    </Wrapper>
  )
})
