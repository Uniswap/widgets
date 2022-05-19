import { Trans } from '@lingui/macro'
import { Wallet as WalletIcon } from 'icons'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { TextButton } from './Button'
import Row from './Row'

interface WalletProps {
  disabled?: boolean
  onClick?: () => void
}

const WalletButton = styled(TextButton)<{ hidden?: boolean }>`
  filter: none;
  visibility: ${({ hidden }) => hidden && 'hidden'};
`

export default function Wallet({ disabled, onClick }: WalletProps) {
  return (
    <WalletButton onClick={onClick} color="secondary" disabled={!onClick} hidden={disabled} data-testid="wallet">
      <ThemedText.Caption>
        <Row gap={0.5}>
          <WalletIcon />
          <Trans>Connect wallet to swap</Trans>
        </Row>
      </ThemedText.Caption>
    </WalletButton>
  )
}
