import { Trans } from '@lingui/macro'
import { HelpCircle } from 'icons'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Column from '../Column'

const HelpCircleIcon = styled(HelpCircle)`
  height: 4rem;
  margin-bottom: 0.75rem;
  stroke: ${({ theme }) => theme.secondary};
  width: 4rem;
`

const StyledColumn = styled(Column)`
  display: flex;
  height: 80%;
  text-align: center;
  width: 100%;
`

export default function NoTokensAvailableOnNetwork() {
  return (
    <StyledColumn align="center" justify="center">
      <HelpCircleIcon />
      <ThemedText.Body1 color="primary">
        <Trans>No tokens are available on this network. Please switch to another network.</Trans>
      </ThemedText.Body1>
    </StyledColumn>
  )
}
