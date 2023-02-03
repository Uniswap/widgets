import { useWeb3React } from '@web3-react/core'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const MISSING_PROVIDER = Symbol()
const BlockNumberContext = createContext<
  | {
      value?: number
      fastForward(block: number): void
    }
  | typeof MISSING_PROVIDER
>(MISSING_PROVIDER)

function useBlockNumberContext() {
  const blockNumber = useContext(BlockNumberContext)
  if (blockNumber === MISSING_PROVIDER) {
    throw new Error('BlockNumber hooks must be wrapped in a <BlockNumberProvider>')
  }
  return blockNumber
}

/** Requires that BlockUpdater be installed in the DOM tree. */
export default function useBlockNumber(): number | undefined {
  return useBlockNumberContext().value
}

export function useFastForwardBlockNumber(): (block: number) => void {
  return useBlockNumberContext().fastForward
}

export function Provider({ children }: PropsWithChildren) {
  const { chainId: activeChainId, provider } = useWeb3React()
  const [{ chainId, block }, setChainBlock] = useState<{ chainId?: number; block?: number }>({ chainId: activeChainId })

  const isThrottle = useRef(false)

  const onBlock = useCallback(
    (block: number) => {
      if (isThrottle.current) return

      isThrottle.current = true
      setChainBlock((chainBlock) => {
        if (chainBlock.chainId === activeChainId) {
          if (!chainBlock.block || chainBlock.block < block) {
            return { chainId: activeChainId, block }
          }
        }
        return chainBlock
      })
      setTimeout(() => (isThrottle.current = false), 300)
    },
    [activeChainId]
  )

  const isWindowVisible = useIsWindowVisible()
  useEffect(() => {
    if (provider && activeChainId && isWindowVisible) {
      // If chainId hasn't changed, don't clear the block. This prevents re-fetching still valid data.
      setChainBlock((chainBlock) => (chainBlock.chainId === activeChainId ? chainBlock : { chainId: activeChainId }))

      let stale = false
      provider
        .getBlockNumber()
        .then((block) => {
          if (stale) return
          onBlock(block)
        })
        .catch((error: Error) => {
          if (stale) return
          console.error(`Failed to get block number for chainId ${activeChainId}`, error)
        })

      provider.on('block', onBlock)
      return () => {
        stale = true
        provider.off('block', onBlock)
      }
    }
    return undefined
  }, [activeChainId, provider, onBlock, setChainBlock, isWindowVisible])

  const value = useMemo(
    () => ({
      value: chainId === activeChainId ? block : undefined,
      fastForward: (update: number) => {
        if (block && update > block) {
          setChainBlock({ chainId: activeChainId, block: update })
        }
      },
    }),
    [activeChainId, block, chainId]
  )
  return <BlockNumberContext.Provider value={value}>{children}</BlockNumberContext.Provider>
}
