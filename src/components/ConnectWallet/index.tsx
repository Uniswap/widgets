import { useConnections } from 'hooks/connectWeb3/useConnect'
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
  const connections = useConnections()
  useEffect(() => {
    console.log('connect eagerly', connections)
    connections.forEach(([wallet, _]) => void wallet.connectEagerly())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isConnected = Boolean(account)
  return isConnected ? (
    <ConnectedWalletChip disabled={disabled} account={account} />
  ) : (
    <ConnectWallet disabled={disabled} onIntegratorConnectWalletCallback={onConnectWallet} />
  )
}
