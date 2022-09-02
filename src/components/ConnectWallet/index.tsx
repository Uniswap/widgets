import { useWeb3React } from '@web3-react/core'
import { connections, defaultChainIdAtom, getConnectorName } from 'components/ActiveWeb3ReactProvider'
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
    connections.forEach(([wallet, _]) => {
      const success = wallet.connectEagerly ? wallet.connectEagerly(defaultChainId) : wallet.activate(defaultChainId)
      success?.catch(() => {
        if (stale) return
        console.error(`Could not connect to ${getConnectorName(wallet)}`)
      })
    })

    let stale = false
    return () => {
      stale = true
    }
  }, [defaultChainId])

  const { account, isActive } = useWeb3React()

  const isAccountConnected = isActive && Boolean(account)
  return isAccountConnected ? (
    <ConnectedWalletChip disabled={disabled} account={account} />
  ) : (
    <ConnectWallet disabled={disabled} />
  )
}
