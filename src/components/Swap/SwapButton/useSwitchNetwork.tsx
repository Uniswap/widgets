import { Trans } from '@lingui/macro'
import { Action } from 'components/ActionButton'
import { useWeb3React } from '@web3-react/core'
import { Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'

export default function useSwitchNetwork(inputCurrencyChainId?: number) {
  const { chainId, connector } = useWeb3React()

  const [isPending, setIsPending] = useState(false)
  const onSwitchNetwork = useCallback(async () => {
    setIsPending(true)
    try {
      await connector.activate(inputCurrencyChainId)
      setIsPending(false)
    } catch {
      // if user cancels switch network request in-wallet
      setIsPending(false)
    }
  }, [chainId, connector])
  const switchNetworkAction = useMemo((): Action | undefined => {
    if (chainId && inputCurrencyChainId && chainId !== inputCurrencyChainId) {
      return isPending
        ? { message: <Trans>Switch network in your wallet</Trans>, icon: Spinner }
        : {
            message: <Trans>Switch network</Trans>,
            onClick: onSwitchNetwork,
            children: <Trans>Switch</Trans>,
          }
    }
    return undefined
  }, [chainId, inputCurrencyChainId, isPending, onSwitchNetwork])

  return switchNetworkAction
}
