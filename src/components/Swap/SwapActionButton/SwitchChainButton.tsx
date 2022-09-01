import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import useSwitchNetwork from 'hooks/useSwitchNetwork'
import { Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'
import { Colors } from 'theme'

/** A chain-switching ActionButton. */
export default function ChainSwitchButton({ color, chainId }: { color: keyof Colors; chainId: number }) {
  const [isPending, setIsPending] = useState(false)
  const switchNetwork = useSwitchNetwork()
  const onSwitchNetwork = useCallback(async () => {
    setIsPending(true)
    try {
      await switchNetwork(chainId)
    } finally {
      setIsPending(false)
    }
  }, [chainId, switchNetwork])

  const actionProps = useMemo(
    () =>
      isPending
        ? {
            message: <Trans>Switch network in your wallet</Trans>,
            icon: Spinner,
          }
        : {
            message: <Trans>Switch network</Trans>,
            onClick: onSwitchNetwork,
            children: <Trans>Switch</Trans>,
          },
    [isPending, onSwitchNetwork]
  )

  return <ActionButton color={color} {...actionProps}></ActionButton>
}
