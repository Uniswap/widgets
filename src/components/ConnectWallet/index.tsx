import { useWeb3React } from '@web3-react/core'

import ConnectedWalletChip from './ConnectedWalletChip'
import ConnectWallet from './ConnectWallet'

interface WalletProps {
  disabled?: boolean
}

export default function Wallet({ disabled }: WalletProps) {
  const { account, isActive } = useWeb3React()
  return isActive && Boolean(account) ? (
    <ConnectedWalletChip disabled={disabled} account={account} />
  ) : (
    <ConnectWallet disabled={disabled} />
  )
}
