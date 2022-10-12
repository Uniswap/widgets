import { Trans } from '@lingui/macro'
import { useSigner } from 'components/SignerProvider'
import ActionButton from 'components/ActionButton'
import useSwitchChain from 'hooks/useSwitchChain'
import { Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'
import { Colors } from 'theme'

/** A chain-switching ActionButton. */
export default function ChainSwitchButton({ color, chainId }: { color: keyof Colors; chainId: number }) {
  const { account } = useSigner()
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

  const actionProps = useMemo(
    () =>
      isPending
        ? {
            message: account ? <Trans>Switch network in your wallet</Trans> : <Trans>Switching network</Trans>,
            icon: Spinner,
          }
        : {
            message: <Trans>Switch network</Trans>,
            onClick: onSwitchChain,
            children: <Trans>Switch</Trans>,
          },
    [account, isPending, onSwitchChain]
  )

  return <ActionButton color={color} action={actionProps} />
}
