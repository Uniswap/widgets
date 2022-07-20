import { useEffect, useRef } from 'react'

/**
 * Returns the last value of type T that passes a filter function
 * @param value changing value
 * @param filterFn function that determines whether a given value should be considered for the last value
 */
export default function useLast<T>(
  value: T | undefined,
  filterFn: (value: T | undefined, current: T | undefined) => boolean = () => true
): T | undefined {
  const last = useRef<typeof value>(filterFn(value, undefined) ? value : undefined)
  useEffect(() => {
    if (filterFn(value, last.current)) {
      last.current = value
    }
  }, [value, filterFn])
  return last.current
}
