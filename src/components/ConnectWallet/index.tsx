import { useSigner } from 'components/SignerProvider'

import ConnectedWalletChip from './ConnectedWalletChip'
import ConnectWallet from './ConnectWallet'

interface WalletProps {
  disabled?: boolean
}

export default function Wallet({ disabled }: WalletProps) {
  const { account, isActive } = useSigner()
  return isActive && Boolean(account) ? (
    <ConnectedWalletChip disabled={disabled} account={account} />
  ) : (
    <ConnectWallet disabled={disabled} />
  )
}
