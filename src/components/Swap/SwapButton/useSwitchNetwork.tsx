import { Trans } from '@lingui/macro'
import { Action } from 'components/ActionButton'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'

export default function useSwitchNetwork(inputCurrencyChainId?: number) {
  const { chainId, connector } = useActiveWeb3React()

  const [isPending, setIsPending] = useState(false)
  const onSwitchNetwork = useCallback(async () => {
    setIsPending(true)
    connector.activate(inputCurrencyChainId)?.then(() => setIsPending(false)) // todo: check if connectEagerly works here?
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
