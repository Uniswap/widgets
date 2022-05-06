import { Trans } from '@lingui/macro'
import styled, { css } from 'styled-components/macro'

import { HelpCircle } from '../../icons'
import { ThemedText } from '../../theme'
import Column from '../Column'

const HelpCircleIcon = styled(HelpCircle)`
  height: 64px;
  margin-bottom: 12px;
  stroke: ${({ theme }) => theme.secondary};
  width: 64px;
`

const wrapperCss = css`
  display: flex;
  height: 80%;
  text-align: center;
  width: 100%;
`

export default function NoTokensAvailableOnNetwork() {
  return (
    <Column align="center" justify="center" css={wrapperCss}>
      <HelpCircleIcon />
      <ThemedText.Body1 color="primary">
        <Trans>No tokens are available on this network. Please switch to another network.</Trans>
      </ThemedText.Body1>
    </Column>
  )
}
