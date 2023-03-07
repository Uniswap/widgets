import { useWeb3React } from '@web3-react/core'

import ConnectedWalletChip from './ConnectedWalletChip'

interface WalletProps {
  disabled?: boolean
}

export default function Wallet({ disabled }: WalletProps) {
  const { account, isActive } = useWeb3React()
  if (!isActive || !Boolean(account)) {
    return null
  }
  return <ConnectedWalletChip disabled={disabled} account={account} />
}
