import { TextButton } from 'components/Button'
import Row from 'components/Row'
import Identicon from 'icons/identicon'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const AccountButton = styled(TextButton)<{ hidden?: boolean }>`
  filter: none;
  visibility: ${({ hidden }) => hidden && 'hidden'};
`

export default function ConnectedWalletChip({ disabled, account }: { disabled?: boolean; account?: string }) {
  // TODO(kristiehuang): AccountDialog UI does not yet exist
  // const [open, setOpen] = useState(false)

  return (
    <>
      <AccountButton
        hidden={disabled}
        // onClick={() => console.log('open account modal')}
        color="secondary"
        data-testid="wallet"
      >
        <ThemedText.Subhead2>
          <Row gap={0.5}>
            <Identicon />
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </Row>
        </ThemedText.Subhead2>
      </AccountButton>
      {/* {open && (
        <Dialog color="module" onClose={() => setOpen(false)}>
          <AccountDialog />
        </Dialog>
      )} */}
    </>
  )
}
