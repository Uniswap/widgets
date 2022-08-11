import { useAtom } from 'jotai'
import { useEffect } from 'react'
import {
  Field,
  onReviewSwapClickAtom,
  OnSwapChangeCallbacks,
  onSwapChangeCallbacksAtom,
  onTokenSelectorClickAtom,
} from 'state/swap'
import { onConnectWalletClickAtom } from 'state/wallet'

interface UseSyncEventHandlersArgs extends OnSwapChangeCallbacks {
  onConnectWalletClick?: () => void | Promise<boolean>
  onReviewSwapClick?: () => void | Promise<boolean>
  onTokenSelectorClick?: (f: Field) => void | Promise<boolean>
}

export default function useSyncEventHandlers(handlers: UseSyncEventHandlersArgs): void {
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
        (old: ((f: Field) => void | Promise<boolean>) | undefined) => (old = handlers.onTokenSelectorClick)
      )
    }
  }, [handlers.onTokenSelectorClick, onTokenSelectorClick, setOnTokenSelectorClick])

  const [onSwapChangeCallbacks, setOnSwapChangeCallbacks] = useAtom(onSwapChangeCallbacksAtom)
  useEffect(() => {
    if (
      handlers.onInputTokenChange !== onSwapChangeCallbacks.onInputTokenChange ||
      handlers.onOutputTokenChange !== onSwapChangeCallbacks.onOutputTokenChange ||
      handlers.onAmountChange !== onSwapChangeCallbacks.onAmountChange ||
      handlers.onIndependentFieldChange !== onSwapChangeCallbacks.onIndependentFieldChange
    ) {
      setOnSwapChangeCallbacks((old: OnSwapChangeCallbacks) => {
        old.onInputTokenChange = handlers.onInputTokenChange
        old.onOutputTokenChange = handlers.onOutputTokenChange
        old.onAmountChange = handlers.onAmountChange
        old.onIndependentFieldChange = handlers.onIndependentFieldChange
        return old
      })
    }
  }, [
    handlers.onInputTokenChange,
    handlers.onOutputTokenChange,
    handlers.onAmountChange,
    handlers.onIndependentFieldChange,
    onSwapChangeCallbacks,
    setOnSwapChangeCallbacks,
  ])
}
