import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import ActionButton from 'components/ActionButton'
import useSwitchChain from 'hooks/useSwitchChain'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme'

/** A chain-switching ActionButton. */
export default function ChainSwitchButton({ color, chainId }: { color: keyof Colors; chainId: number }) {
  const { account } = useWeb3React()
  const [isPending, setIsPending] = useState(!account)

  const switchChain = useSwitchChain()
  const onSwitchChain = useCallback(async () => {
    setIsPending(true)
    try {
      await switchChain(chainId)
    } finally {
      setIsPending(false)
    }
  }, [chainId, switchChain])

  // If there is no account (ie no wallet to take agency), switch chains automatically
  useEffect(() => {
    if (!account) onSwitchChain()
  }, [account, onSwitchChain])

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
