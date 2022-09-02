import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import useSwitchChain from 'hooks/useSwitchChain'
import { Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'
import { Colors } from 'theme'

/** A chain-switching ActionButton. */
export default function ChainSwitchButton({ color, chainId }: { color: keyof Colors; chainId: number }) {
  const [isPending, setIsPending] = useState(false)
  const switchChain = useSwitchChain()
  const onSwitchChain = useCallback(async () => {
    setIsPending(true)
    try {
      await switchChain(chainId)
    } finally {
      setIsPending(false)
    }
  }, [chainId, switchChain])

  const actionProps = useMemo(
    () =>
      isPending
        ? {
            message: <Trans>Switch network in your wallet</Trans>,
            icon: Spinner,
          }
        : {
            message: <Trans>Switch network</Trans>,
            onClick: onSwitchChain,
            children: <Trans>Switch</Trans>,
          },
    [isPending, onSwitchChain]
  )

  return <ActionButton color={color} action={actionProps} />
}
