import Wallet from 'components/Wallet'

import ConnectedWalletChip from './ConnectedWalletChip'

interface ConnectWalletProps {
  account?: string
  onConnectWallet?: () => void
}

export default function ConnectWallet({ account, onConnectWallet }: ConnectWalletProps) {
  if (Boolean(account)) {
    return <ConnectedWalletChip account={account} />
  } else {
    return <Wallet onIntegratorConnectWalletCallback={onConnectWallet} />
  }
}
