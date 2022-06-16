import Wallet from 'components/Wallet'
import { connections } from 'hooks/connectWeb3/useConnect'
import { useEffect } from 'react'

import ConnectedWalletChip from './ConnectedWalletChip'

interface ConnectWalletProps {
  account?: string
  shouldOpenIntegratorFlow: boolean
  onConnectWallet?: () => void
}

export default function ConnectWallet({ account, shouldOpenIntegratorFlow, onConnectWallet }: ConnectWalletProps) {
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
      <Wallet shouldOpenIntegratorFlow={shouldOpenIntegratorFlow} onIntegratorConnectWalletCallback={onConnectWallet} />
    )
  }
}
