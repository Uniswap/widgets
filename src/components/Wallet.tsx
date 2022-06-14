import { Trans } from '@lingui/macro'
import { Wallet as WalletIcon } from 'icons'
import { useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { TextButton } from './Button'
import Dialog from './Dialog'
import Row from './Row'
import { ConnectWalletDialog } from './Swap/ConnectWallet'

interface WalletProps {
  disabled?: boolean
  shouldOpenIntegratorFlow: boolean
  onClick?: () => void
}

const WalletButton = styled(TextButton)<{ hidden?: boolean }>`
  filter: none;
  visibility: ${({ hidden }) => hidden && 'hidden'};
`

export default function Wallet({ shouldOpenIntegratorFlow, onClick }: WalletProps) {
  const [open, setOpen] = useState(false)

  // TODO(kristiehuang): rename onClick to make distinction between integrator-provided callback
  // for now, onClick = provided callback from integrator
  // if onClick == null: open our wallet connect modal flow
  const onOpenConnectWalletModal = useCallback(() => setOpen(true), [])
  const onClose = useCallback(() => setOpen(false), [])

  return (
    <>
      <WalletButton
        onClick={shouldOpenIntegratorFlow ? onClick : onOpenConnectWalletModal}
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
