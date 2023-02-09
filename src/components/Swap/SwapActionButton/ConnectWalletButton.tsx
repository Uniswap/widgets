import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'
import { onConnectWalletClickAtom } from 'state/wallet'

/** An ActionButton that opens the wallet connection dialog. */
export default function ConnectWalletButton() {
  const onConnectWalletClick = useConditionalHandler(useAtomValue(onConnectWalletClickAtom))
  const onClick = useCallback(async () => {
    await onConnectWalletClick()
  }, [onConnectWalletClick])
  return (
    <>
      <ActionButton color="accentSoft" onClick={onClick} data-testid="connect-wallet">
        <Trans>Connect wallet</Trans>
      </ActionButton>
    </>
  )
}
