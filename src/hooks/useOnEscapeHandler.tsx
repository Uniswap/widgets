import { useEffect } from 'react'

export function useOnEscapeHandler(onClose?: () => void) {
  useEffect(() => {
    if (!onClose) return

    const close = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', close, true)
    return () => document.removeEventListener('keydown', close, true)
  }, [onClose])
}
