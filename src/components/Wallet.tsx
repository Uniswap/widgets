import { Trans } from '@lingui/macro'
import { Wallet as WalletIcon } from 'icons'
import { useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { TextButton } from './Button'
import { ConnectWalletDialog } from './ConnectWallet/ConnectWalletDialog'
import Dialog from './Dialog'
import Row from './Row'

interface WalletProps {
  disabled?: boolean
  shouldOpenIntegratorFlow: boolean
  onIntegratorConnectWalletCallback?: () => void
}

const WalletButton = styled(TextButton)<{ hidden?: boolean }>`
  filter: none;
  visibility: ${({ hidden }) => hidden && 'hidden'};
`

export default function Wallet({ shouldOpenIntegratorFlow, onIntegratorConnectWalletCallback }: WalletProps) {
  const [open, setOpen] = useState(false)

  const onOpen = useCallback(() => setOpen(true), [])
  const onClose = useCallback(() => setOpen(false), [])

  return (
    <>
      <WalletButton
        onClick={shouldOpenIntegratorFlow ? onIntegratorConnectWalletCallback : onOpen}
        color="secondary"
        data-testid="wallet"
      >
        <ThemedText.Caption>
          <Row gap={0.5}>
            <WalletIcon />
            <Trans>Connect wallet to swap</Trans>
          </Row>
        </ThemedText.Caption>
      </WalletButton>
      {open && (
        <Dialog color="dialog" onClose={onClose}>
          <ConnectWalletDialog />
        </Dialog>
      )}
    </>
  )
}
