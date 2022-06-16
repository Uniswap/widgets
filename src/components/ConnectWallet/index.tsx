import { connections } from 'hooks/connectWeb3/useConnect'
import { useEffect } from 'react'

import ConnectedWalletChip from './ConnectedWalletChip'
import ConnectWallet from './ConnectWallet'

interface ConnectWalletProps {
  account?: string
  shouldOpenIntegratorFlow: boolean
  onConnectWallet?: () => void
}

export default function Wallet({ account, shouldOpenIntegratorFlow, onConnectWallet }: ConnectWalletProps) {
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
    return <ConnectedWalletChip account={account} />
  } else {
    return (
      <ConnectWallet
        shouldOpenIntegratorFlow={shouldOpenIntegratorFlow}
        onIntegratorConnectWalletCallback={onConnectWallet}
      />
    )
  }
}
