import Wallet from 'components/Wallet'

import ConnectedWalletChip from './ConnectedWalletChip'

interface ConnectWalletProps {
  account?: string
  onClickConnectWallet?: () => void
}

export default function ConnectWallet({ account, onClickConnectWallet }: ConnectWalletProps) {
  if (Boolean(account)) {
    return <ConnectedWalletChip account={account} />
  } else {
    return <Wallet onClickIntegratorConnectWallet={onClickConnectWallet} />
  }
}
