import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import ActionButton from 'components/ActionButton'
import useSwitchChain from 'hooks/useSwitchChain'
import useConnectors from 'hooks/web3/useConnectors'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme'

/** A chain-switching ActionButton. */
export default function ChainSwitchButton({ color, chainId }: { color: keyof Colors; chainId: number }) {
  const { connector } = useWeb3React()
  const isNetwork = connector === useConnectors().network
  const [isPending, setIsPending] = useState(false)

  const switchChain = useSwitchChain()
  const [error, setError] = useState()
  const onSwitchChain = useCallback(async () => {
    setIsPending(true)
    try {
      await switchChain(chainId)
    } catch (error) {
      setError(error)
    } finally {
      setIsPending(false)
    }
  }, [chainId, switchChain])
  if (error) throw error

  useEffect(() => {
    if (isNetwork && !isPending) {
      onSwitchChain()
    }
  }, [isNetwork, isPending, onSwitchChain])

  const actionProps = useMemo(
    () =>
      isPending
        ? {
            message: isNetwork ? <Trans>Switching network</Trans> : <Trans>Switch network in your wallet</Trans>,
            icon: Spinner,
          }
        : {
            message: <Trans>Switch network</Trans>,
            onClick: onSwitchChain,
            children: <Trans>Switch</Trans>,
          },
    [isNetwork, isPending, onSwitchChain]
  )

  return <ActionButton color={color} action={actionProps} />
}
