import { Trans } from '@lingui/macro'
import { Wallet as WalletIcon } from 'icons'
import { useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { TextButton } from '../Button'
import Dialog from '../Dialog'
import Row from '../Row'
import { ConnectWalletDialog } from './ConnectWalletDialog'

interface ConnectWalletProps {
  disabled?: boolean
  onIntegratorConnectWalletCallback?: false | ((e?: React.MouseEvent<HTMLButtonElement>) => void)
}

const WalletButton = styled(TextButton)<{ hidden?: boolean }>`
  filter: none;
  visibility: ${({ hidden }) => hidden && 'hidden'};
`

export default function ConnectWallet({ disabled, onIntegratorConnectWalletCallback }: ConnectWalletProps) {
  // Opens a dialog that initiates own wallet connection flow
  const [open, setOpen] = useState(false)

  const onClose = useCallback(() => setOpen(false), [])

  const onClick = useCallback(
    // Block our own flow iff e.defaultPrevented or onIntegratorConnectWalletCallback === false
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      if (onIntegratorConnectWalletCallback === false) return
      if (onIntegratorConnectWalletCallback) {
        onIntegratorConnectWalletCallback(e)
        if (e && e.defaultPrevented) return
      }
      setOpen(true) // Initiate our own wallet connection flow
    },
    [onIntegratorConnectWalletCallback]
  )

  return (
    <>
      <WalletButton hidden={disabled} onClick={onClick} color="secondary" data-testid="wallet">
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
