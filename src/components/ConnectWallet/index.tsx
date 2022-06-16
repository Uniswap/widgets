import { connections } from 'hooks/connectWeb3/useConnect'
import { useEffect } from 'react'

import ConnectedWalletChip from './ConnectedWalletChip'
import ConnectWallet from './ConnectWallet'

interface WalletProps {
  disabled?: boolean
  account?: string
  shouldOpenIntegratorFlow: boolean
  onConnectWallet?: () => void
}

export default function Wallet({ disabled, account, shouldOpenIntegratorFlow, onConnectWallet }: WalletProps) {
  // Attempt to connect eagerly on mount
  useEffect(() => {
    connections.forEach(
      ([wallet, _]) =>
        void wallet.connectEagerly().catch(() => {
          console.debug('Failed to connect eagerly to wallet')
        })
    )
  }, [])

  if (Boolean(account)) {
    return <ConnectedWalletChip disabled={disabled} account={account} />
  } else {
    return (
      <ConnectWallet
        disabled={disabled}
        shouldOpenIntegratorFlow={shouldOpenIntegratorFlow}
        onIntegratorConnectWalletCallback={onConnectWallet}
      />
    )
  }
}
