import { useWeb3React } from '@web3-react/core'
import { connections, defaultChainId } from 'hooks/connectWeb3/useWeb3React'
import { useEffect } from 'react'

import ConnectedWalletChip from './ConnectedWalletChip'
import ConnectWallet from './ConnectWallet'

interface WalletProps {
  disabled?: boolean
  onClickConnectWallet?: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Wallet({ disabled, onClickConnectWallet }: WalletProps) {
  // Attempt to connect eagerly on mount
  useEffect(() => {
    connections.forEach(([wallet, _]) =>
      wallet.connectEagerly
        ? wallet.connectEagerly(defaultChainId)?.catch((e) => console.log(e))
        : wallet.activate(defaultChainId)
    )
  }, [connections, defaultChainId])

  const { account, isActive } = useWeb3React()

  const isConnected = isActive && Boolean(account)
  return isConnected ? (
    <ConnectedWalletChip disabled={disabled} />
  ) : (
    <ConnectWallet disabled={disabled} onIntegratorConnectWalletCallback={onClickConnectWallet} />
  )
}
