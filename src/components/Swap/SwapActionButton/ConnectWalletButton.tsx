import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import { getChainInfo } from 'constants/chainInfo'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'
import { onConnectWalletClickAtom } from 'state/wallet'

/** An ActionButton that opens the wallet connection dialog. */
export default function ConnectWalletButton({ chainId }: { chainId: number }) {
  const chainInfo = getChainInfo(chainId)

  const onConnectWalletClick = useConditionalHandler(useAtomValue(onConnectWalletClickAtom))
  const onClick = useCallback(async () => {
    await onConnectWalletClick(chainId)
  }, [onConnectWalletClick, chainId])
  return (
    <>
      <ActionButton color="accentSoft" onClick={onClick} data-testid="connect-wallet">
        <Trans>Connect {chainInfo?.label} wallet</Trans>
      </ActionButton>
    </>
  )
}
