import Wallet from 'components/Wallet'

import ConnectedWalletChip from './ConnectedWalletChip'

interface ConnectWalletProps {
  account?: string
  shouldOpenIntegratorFlow: boolean
  onConnectWallet?: () => void
}

export default function ConnectWallet({ account, shouldOpenIntegratorFlow, onConnectWallet }: ConnectWalletProps) {
  if (Boolean(account)) {
    return <ConnectedWalletChip account={account} />
  } else {
    return (
      <Wallet shouldOpenIntegratorFlow={shouldOpenIntegratorFlow} onIntegratorConnectWalletCallback={onConnectWallet} />
    )
  }
}
