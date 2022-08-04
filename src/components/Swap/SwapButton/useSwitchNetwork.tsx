import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { Action } from 'components/ActionButton'
import { Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'

export default function useSwitchNetwork(desiredChainId?: number) {
  const { chainId, connector } = useWeb3React()

  const [isPending, setIsPending] = useState(false)
  const onSwitchNetwork = useCallback(async () => {
    setIsPending(true)
    try {
      const desiredChainIdHex = `0x${desiredChainId?.toString(16)}`
      // FIXME: use connector.activate(desiredChainIdOrParams) like in interface's switchChain
      await connector.provider
        ?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        })
        .then(() => connector.activate(desiredChainId))
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
