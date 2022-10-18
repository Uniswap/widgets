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
  visibility: ${({ hidden }) => (hidden ? 'hidden' : 'visible')};
`

export default function ConnectedWalletChip({ disabled, account }: { disabled?: boolean; account?: string }) {
  const [hover, setHover] = useState(false)
  const { connector } = useWeb3React()

  return (
    <>
      <AccountButton
        hidden={disabled}
        onClick={() => (connector.deactivate ? connector.deactivate() : connector.resetState())}
        color="secondary"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        data-testid="account"
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
    </>
  )
}
