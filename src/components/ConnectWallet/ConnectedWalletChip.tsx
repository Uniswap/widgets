import { Trans } from '@lingui/macro'
import { Wallet as WalletIcon } from 'icons'
import { useWeb3React } from '@web3-react/core'
import { TextButton } from 'components/Button'
import Row from 'components/Row'
import Identicon from 'icons/identicon'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { useState } from 'react'

const AccountButton = styled(TextButton)<{ hidden?: boolean }>`
  filter: none;
  visibility: ${({ hidden }) => hidden && 'hidden'};
`

const AccountButtonText = styled(ThemedText.Subhead2)``

export default function ConnectedWalletChip({ disabled }: { disabled?: boolean }) {
  // TODO(kristiehuang): AccountDialog UI does not yet exist
  // const [open, setOpen] = useState(false)

  const [hover, setHover] = useState(false)

  const { account } = useWeb3React()

  return (
    <>
      <AccountButton
        hidden={disabled}
        // onClick={() => console.log('open account modal')}
        color="secondary"
        data-testid="wallet"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {hover ? (
          <ThemedText.Caption>
            <Row gap={0.5}>
              <WalletIcon />
              <Trans>Disconnect wallet</Trans>
            </Row>
          </ThemedText.Caption>
        ) : (
          <Row gap={0.5}>
            <Identicon />
            <ThemedText.Subhead2>
              {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
            </ThemedText.Subhead2>
          </Row>
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
