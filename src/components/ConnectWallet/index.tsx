import { useWeb3React } from '@web3-react/core'
import { connections } from 'hooks/connectWeb3/useWeb3React'
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
    connections.forEach(([wallet, _]) => {
      if (wallet.connectEagerly) {
        wallet.connectEagerly()?.catch(() => {
          console.debug('Failed to connect eagerly')
        })
      } else {
        wallet.activate()?.catch(() => {
          console.debug('Failed to activate')
        })
      }
    })
  }, [])

  const { account, isActive } = useWeb3React()

  const isConnected = isActive && Boolean(account)
  return isConnected ? (
    <ConnectedWalletChip disabled={disabled} />
  ) : (
    <ConnectWallet disabled={disabled} onIntegratorConnectWalletCallback={onClickConnectWallet} />
  )
}
