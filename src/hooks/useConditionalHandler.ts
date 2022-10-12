import { useCallback } from 'react'

export function useConditionalHandler<T extends (...args: any[]) => void | boolean | Promise<boolean>>(
  handler?: T
): (...params: Parameters<T>) => Promise<boolean> {
  return useCallback(
    async (...params) => {
      if (!handler) return true

      try {
        const result = await handler(...params)
        if (result === false) return false
      } catch {
        return false
      }
      return true
    },
    [handler]
  )
}
