import { Trans } from '@lingui/macro'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { Wallet as WalletIcon } from 'icons'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useState } from 'react'
import { onConnectWalletClickAtom } from 'state/wallet'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { TextButton } from '../Button'
import Dialog from '../Dialog'
import Row from '../Row'
import { ConnectWalletDialog } from './ConnectWalletDialog'

interface ConnectWalletProps {
  disabled?: boolean
}

const WalletButton = styled(TextButton)<{ hidden?: boolean }>`
  filter: none;
  visibility: ${({ hidden }) => (hidden ? 'hidden' : 'visible')};
`

export default function ConnectWallet({ disabled }: ConnectWalletProps) {
  // Opens a dialog that initiates own wallet connection flow
  const [open, setOpen] = useState(false)
  const onClose = () => setOpen(false)

  const onConnectWalletClick = useConditionalHandler(useAtomValue(onConnectWalletClickAtom))
  const onClick = useCallback(async () => {
    setOpen(await onConnectWalletClick())
  }, [onConnectWalletClick])

  return (
    <>
      <WalletButton hidden={disabled} onClick={onClick} color="secondary" data-testid="connect-wallet">
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
