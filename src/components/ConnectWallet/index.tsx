import { connections } from 'hooks/connectWeb3/useConnect'
import { useEffect } from 'react'

import ConnectedWalletChip from './ConnectedWalletChip'
import ConnectWallet from './ConnectWallet'

interface WalletProps {
  disabled?: boolean
  account?: string
  onConnectWallet?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Wallet({ disabled, account, onConnectWallet }: WalletProps) {
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
    return <ConnectWallet disabled={disabled} onIntegratorConnectWalletCallback={onConnectWallet} />
  }
}
