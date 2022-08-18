import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { Field, onReviewSwapClickAtom, onTokenSelectorClickAtom } from 'state/swap'
import { onConnectWalletClickAtom } from 'state/wallet'

export interface EventHandlers {
  onConnectWalletClick?: () => void | Promise<boolean>
  onReviewSwapClick?: () => void | Promise<boolean>
  onTokenSelectorClick?: (field: Field) => void | Promise<boolean>
}

export default function useSyncEventHandlers({
  onConnectWalletClick,
  onReviewSwapClick,
  onTokenSelectorClick,
}: EventHandlers): void {
  const setOnReviewSwapClick = useUpdateAtom(onReviewSwapClickAtom)
  useEffect(() => setOnReviewSwapClick((old) => (old = onReviewSwapClick)), [onReviewSwapClick, setOnReviewSwapClick])

  const setOnConnectWalletClick = useUpdateAtom(onConnectWalletClickAtom)
  useEffect(
    () => setOnConnectWalletClick((old) => (old = onConnectWalletClick)),
    [onConnectWalletClick, setOnConnectWalletClick]
  )

  const setOnTokenSelectorClick = useUpdateAtom(onTokenSelectorClickAtom)
  useEffect(
    () => setOnTokenSelectorClick((old: typeof onTokenSelectorClick) => (old = onTokenSelectorClick)),
    [onTokenSelectorClick, setOnTokenSelectorClick]
  )
}
