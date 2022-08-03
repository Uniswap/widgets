import { useWeb3React } from '@web3-react/core'
import { connections, defaultChainIdAtom, getConnectorName } from 'hooks/connectWeb3/useWeb3React'
import { useAtomValue } from 'jotai/utils'
import { useEffect } from 'react'

import ConnectedWalletChip from './ConnectedWalletChip'
import ConnectWallet from './ConnectWallet'

interface WalletProps {
  disabled?: boolean
  onConnectWalletClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Wallet({ disabled, onConnectWalletClick }: WalletProps) {
  // Attempt to connect eagerly on mount, and prompt switch networks when integrator's defaultChainId changes
  const defaultChainId = useAtomValue(defaultChainIdAtom)
  useEffect(() => {
    connections.forEach(([wallet, _]) =>
      wallet.connectEagerly
        ? wallet.connectEagerly(defaultChainId)?.catch(() => {
            console.log('Could not connect eagerly to', getConnectorName(wallet))
          })
        : wallet.activate(defaultChainId)?.catch(() => {
            console.log('Could not activate', getConnectorName(wallet))
          })
    )
  }, [defaultChainId])

  const { account, isActive } = useWeb3React()

  const isAccountConnected = isActive && Boolean(account)
  return isAccountConnected ? (
    <ConnectedWalletChip disabled={disabled} account={account} />
  ) : (
    <ConnectWallet disabled={disabled} onIntegratorConnectWalletCallback={onConnectWalletClick} />
  )
}
