import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import ActionButton from 'components/ActionButton'
import useSwitchChain from 'hooks/useSwitchChain'
import { Spinner } from 'icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme'

interface ChainIds {
  inputChainId?: number
  outputChainId?: number
}

function useDesiredChainId({ inputChainId, outputChainId }: ChainIds): number | undefined {
  const { chainId } = useWeb3React()
  if (chainId === undefined) return

  const desiredChainId = inputChainId ?? outputChainId
  if (desiredChainId === chainId) return

  return desiredChainId
}

export function useSwitchChainId(chainIds: ChainIds): number | undefined {
  const { account } = useWeb3React()
  const chainId = useDesiredChainId(chainIds)
  const switchChain = useSwitchChain()

  // If using a provider with no accounts (eg network), switch the chain immediately.
  useEffect(() => {
    if (!account && chainId !== undefined) {
      switchChain(chainId)
    }
  }, [account, chainId, switchChain])
  if (!account) return

  return chainId
}

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
