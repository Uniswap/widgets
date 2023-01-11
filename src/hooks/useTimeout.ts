import { useEffect } from 'react'

/**
 * Invokes callback after a timeout defined by the delay
 * @param callback
 * @param delay if null, the callback will not be invoked
 */
export default function useTimeout(callback: () => void, delay: null | number) {
  useEffect(() => {
    if (delay === null) return
    const timeout = setTimeout(callback, delay)
    return () => clearTimeout(timeout)
  }, [callback, delay])
}
