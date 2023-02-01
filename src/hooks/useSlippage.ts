import { Percent } from '@uniswap/sdk-core'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { slippageAtom } from 'state/swap/settings'

const THREE_PERCENT = new Percent(3, 100) // 3%
export const DEFAULT_SLIPPAGE_PERCENT = THREE_PERCENT

export function toPercent(maxSlippage: string | undefined): Percent | undefined {
  if (!maxSlippage) return undefined
  if (Number.isNaN(maxSlippage)) return undefined
  const numerator = Math.floor(Number(maxSlippage) * 100)
  return new Percent(numerator, 10_000)
}

export interface Slippage {
  default: boolean
  allowed: Percent
  warning?: 'warning' | 'error'
}

export const DEFAULT_SLIPPAGE = { default: true, allowed: DEFAULT_SLIPPAGE_PERCENT }

/** Returns the allowed slippage, and whether it is the default slippage. */
export default function useSlippage(): Slippage {
  const slippage = useAtomValue(slippageAtom)
  const maxSlippage = useMemo(() => toPercent(slippage.max), [slippage.max])
  return useMemo(() => {
    if (slippage.default || !maxSlippage) {
      return DEFAULT_SLIPPAGE
    }
    const warning = getSlippageWarning(maxSlippage)
    return { default: false, allowed: maxSlippage, warning }
  }, [maxSlippage, slippage])
}

export const MAX_VALID_SLIPPAGE = new Percent(1, 2)
export const MIN_HIGH_SLIPPAGE = new Percent(3, 100)

export function getSlippageWarning(slippage?: Percent): 'warning' | 'error' | undefined {
  if (slippage?.greaterThan(MAX_VALID_SLIPPAGE)) return 'error'
  if (slippage?.greaterThan(MIN_HIGH_SLIPPAGE)) return 'warning'
  return
}
