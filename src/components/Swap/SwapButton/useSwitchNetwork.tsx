import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { Action } from 'components/ActionButton'
import { switchChain } from 'hooks/connectWeb3/useWeb3React'
import { Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'

export default function useSwitchNetwork(inputCurrency?: Currency) {
  const { chainId, connector } = useWeb3React()

  const [isPending, setIsPending] = useState(false)
  const onSwitchNetwork = useCallback(
    async (desiredChainId: number) => {
      setIsPending(true)
      try {
        await switchChain(connector, desiredChainId)
        setIsPending(false)
      } catch {
        // if user cancels switch network request in-wallet
        setIsPending(false)
      }
    },
    [connector]
  )

  const switchNetworkAction = useMemo((): Action | undefined => {
    if (!inputCurrency) return undefined
    const desiredChainId = inputCurrency.chainId
    if (chainId && chainId !== desiredChainId) {
      return isPending
        ? { message: <Trans>Switch network in your wallet</Trans>, icon: Spinner }
        : {
            message: <Trans>Switch network</Trans>,
            onClick: () => onSwitchNetwork(desiredChainId),
            children: <Trans>Switch</Trans>,
          }
    }
    return undefined
  }, [chainId, isPending, onSwitchNetwork])

  return switchNetworkAction
}
