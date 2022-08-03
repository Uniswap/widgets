import { useWeb3React } from '@web3-react/core'
import { connections, defaultChainIdAtom, getConnectorName } from 'hooks/connectWeb3/useWeb3React'
import { useAtomValue } from 'jotai/utils'
import { useEffect } from 'react'

import ConnectedWalletChip from './ConnectedWalletChip'
import ConnectWallet from './ConnectWallet'

interface WalletProps {
  disabled?: boolean
}

export default function Wallet({ disabled }: WalletProps) {
  // Attempt to connect eagerly on mount
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
    <ConnectWallet disabled={disabled} />
  )
}
