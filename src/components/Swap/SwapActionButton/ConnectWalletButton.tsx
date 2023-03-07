import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import { ConnectWalletDialog } from 'components/ConnectWallet/ConnectWalletDialog'
import Dialog from 'components/Dialog'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useState } from 'react'
import { onConnectWalletClickAtom } from 'state/wallet'

/** An ActionButton that opens the wallet connection dialog. */
export default function ConnectWalletButton() {
  // Opens a dialog that initiates own wallet connection flow
  const [open, setOpen] = useState(false)
  const onClose = () => setOpen(false)
  const onConnectWalletClick = useConditionalHandler(useAtomValue(onConnectWalletClickAtom))
  const onClick = useCallback(async () => {
    setOpen(await onConnectWalletClick())
  }, [onConnectWalletClick])
  return (
    <>
      <ActionButton color="accentSoft" onClick={onClick} data-testid="connect-wallet">
        <Trans>Connect wallet</Trans>
      </ActionButton>
      {open && (
        <Dialog color="dialog" onClose={onClose}>
          <ConnectWalletDialog />
        </Dialog>
      )}
    </>
  )
}
