import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { TextButton } from 'components/Button'
import Row from 'components/Row'
import { WalletDisconnect as WalletDisconnectIcon } from 'icons'
import Identicon from 'icons/identicon'
import { useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const AccountButton = styled(TextButton)<{ hidden?: boolean }>`
  filter: none;
  visibility: ${({ hidden }) => hidden && 'hidden'};
`

export default function ConnectedWalletChip({ disabled, account }: { disabled?: boolean; account?: string }) {
  // TODO(kristiehuang): AccountDialog UI does not yet exist
  // const [open, setOpen] = useState(false)

  // TODO: hover to see disconnect button is temporary; disconnection should live inside AccountDialog
  const [hover, setHover] = useState(false)

  const { connector } = useWeb3React()

  return (
    <>
      <AccountButton
        hidden={disabled}
        onClick={() => (connector.deactivate ? connector.deactivate() : connector.resetState())}
        color="secondary"
        data-testid="wallet"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {hover ? (
          <ThemedText.Caption>
            <Row gap={0.5}>
              <WalletDisconnectIcon />
              <Trans>Disconnect wallet</Trans>
            </Row>
          </ThemedText.Caption>
        ) : (
          <ThemedText.Subhead2>
            <Row gap={0.5}>
              <Identicon />
              {account?.substring(0, 6)}...{account?.substring(account?.length - 4)}
            </Row>
          </ThemedText.Subhead2>
        )}
      </AccountButton>
      {/* {open && (
        <Dialog color="module" onClose={() => setOpen(false)}>
          <AccountDialog />
        </Dialog>
      )} */}
    </>
  )
}
