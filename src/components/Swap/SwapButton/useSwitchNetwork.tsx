import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { Action } from 'components/ActionButton'
import { switchChain } from 'hooks/connectWeb3/useWeb3React'
import { Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'

export default function useSwitchNetwork(desiredChainId: number) {
  const { chainId, connector } = useWeb3React()

  const [isPending, setIsPending] = useState(false)
  const onSwitchNetwork = useCallback(async () => {
    setIsPending(true)
    try {
      await switchChain(connector, desiredChainId)
      setIsPending(false)
    } catch {
      // if user cancels switch network request in-wallet
      setIsPending(false)
    }
  }, [desiredChainId, connector])

  const switchNetworkAction = useMemo((): Action | undefined => {
    if (chainId && desiredChainId && chainId !== desiredChainId) {
      return isPending
        ? { message: <Trans>Switch network in your wallet</Trans>, icon: Spinner }
        : {
            message: <Trans>Switch network</Trans>,
            onClick: onSwitchNetwork,
            children: <Trans>Switch</Trans>,
          }
    }
    return undefined
  }, [chainId, desiredChainId, isPending, onSwitchNetwork])

  return switchNetworkAction
}
