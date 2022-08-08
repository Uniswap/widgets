import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { onReviewSwapClickAtom, onTokenSelectorClickAtom } from 'state/swap'
import { onConnectWalletClickAtom } from 'state/wallet'

interface UseIntegratorEventHandlersArgs {
  onConnectWalletClick?: () => void | Promise<boolean>
  onReviewSwapClick?: () => void | Promise<boolean>
  onTokenSelectorClick?: () => void | Promise<boolean>
}

export default function useIntegratorEventHandlers(handlers: UseIntegratorEventHandlersArgs): void {
  const [onReviewSwapClick, setOnReviewSwapClick] = useAtom(onReviewSwapClickAtom)
  useEffect(() => {
    if (handlers.onReviewSwapClick !== onReviewSwapClick) {
      setOnReviewSwapClick((old: (() => void | Promise<boolean>) | undefined) => (old = handlers.onReviewSwapClick))
    }
  }, [handlers.onReviewSwapClick, onReviewSwapClick, setOnReviewSwapClick])

  const [onConnectWalletClick, setOnConnectWalletClick] = useAtom(onConnectWalletClickAtom)
  useEffect(() => {
    if (handlers.onConnectWalletClick !== onConnectWalletClick) {
      setOnConnectWalletClick(
        (old: (() => void | Promise<boolean>) | undefined) => (old = handlers.onConnectWalletClick)
      )
    }
  }, [handlers.onConnectWalletClick, onConnectWalletClick, setOnConnectWalletClick])

  const [onTokenSelectorClick, setOnTokenSelectorClick] = useAtom(onTokenSelectorClickAtom)
  useEffect(() => {
    if (handlers.onTokenSelectorClick !== onTokenSelectorClick) {
      setOnTokenSelectorClick(
        (old: (() => void | Promise<boolean>) | undefined) => (old = handlers.onTokenSelectorClick)
      )
    }
  }, [handlers.onTokenSelectorClick, onTokenSelectorClick, setOnTokenSelectorClick])
}
