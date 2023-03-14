import { Trans } from '@lingui/macro'
import ActionButton from 'components/ActionButton'
import { useAsyncError } from 'components/Error/ErrorBoundary'
import { getChainInfo } from 'constants/chainInfo'
import useSwitchChain from 'hooks/useSwitchChain'
import { useEvmAccountAddress } from 'hooks/useSyncWidgetSettings'
import useTokenColorExtraction from 'hooks/useTokenColorExtraction'
import { Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'
import { isStarknetChain } from 'utils/starknet'

/** A chain-switching ActionButton. */
export default function ChainSwitchButton({ chainId }: { chainId: number }) {
  const account = useEvmAccountAddress()
  const [isPending, setIsPending] = useState(false)
  const color = useTokenColorExtraction()
  const isStarknet = isStarknetChain(chainId)
  const chainInfo = getChainInfo(chainId)

  const switchChain = useSwitchChain()
  const throwError = useAsyncError()
  const onSwitchChain = useCallback(async () => {
    setIsPending(true)
    try {
      await switchChain(chainId)
    } catch (error) {
      throwError(error)
    } finally {
      setIsPending(false)
    }
  }, [chainId, switchChain, throwError])

  const actionProps = useMemo(
    () =>
      isStarknet
        ? {
            message: <Trans>Switch network in your wallet to {chainInfo?.label}</Trans>,
            hideButton: true,
          }
        : isPending
        ? {
            message: account ? <Trans>Switch network in your wallet</Trans> : <Trans>Switching network</Trans>,
            icon: Spinner,
          }
        : {
            message: <Trans>Switch network</Trans>,
            onClick: onSwitchChain,
          },
    [account, chainInfo, isStarknet, isPending, onSwitchChain]
  )

  return (
    <ActionButton color={color} disabled={isPending} action={actionProps}>
      <Trans>Switch</Trans>
    </ActionButton>
  )
}
