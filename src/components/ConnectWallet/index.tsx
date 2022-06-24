import { connections } from 'hooks/connectWeb3/useActiveWeb3React'
import { useEffect } from 'react'

import ConnectedWalletChip from './ConnectedWalletChip'
import ConnectWallet from './ConnectWallet'

interface WalletProps {
  disabled?: boolean
  account?: string
  onConnectWallet?: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Wallet({ disabled, account, onConnectWallet }: WalletProps) {
  // Attempt to connect eagerly on mount
  useEffect(() => {
    connections.forEach(([wallet, _]) => wallet.connectEagerly())
  }, [])

  const isConnected = Boolean(account)
  return isConnected ? (
    <ConnectedWalletChip disabled={disabled} account={account} />
  ) : (
    <ConnectWallet disabled={disabled} onIntegratorConnectWalletCallback={onConnectWallet} />
  )
}
