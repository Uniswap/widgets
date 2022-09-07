import { useWeb3React } from '@web3-react/core'
import { useConnectors } from 'components/ActiveWeb3ReactProvider'
import { useEffect } from 'react'

import ConnectedWalletChip from './ConnectedWalletChip'
import ConnectWallet from './ConnectWallet'

interface WalletProps {
  disabled?: boolean
}

export default function Wallet({ disabled }: WalletProps) {
  // Attempt to connect eagerly on mount
  const connectors = useConnectors()
  useEffect(() => {
    if (connectors.user) return
    for (const connector of [connectors.metaMask, connectors.walletConnect]) {
      connector.connectEagerly()
    }
  }, [connectors.metaMask, connectors.user, connectors.walletConnect])

  const { account, isActive } = useWeb3React()
  return isActive && Boolean(account) ? (
    <ConnectedWalletChip disabled={disabled} account={account} />
  ) : (
    <ConnectWallet disabled={disabled} />
  )
}
