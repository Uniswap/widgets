import { formatPriceImpact } from '@uniswap/conedison/format'
import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import useAutoSlippageTolerance, { DEFAULT_AUTO_SLIPPAGE } from 'hooks/useAutoSlippageTolerance'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { slippageAtom } from 'state/swap/settings'

export function toPercent(maxSlippage: string | undefined): Percent | undefined {
  if (!maxSlippage) return undefined
  if (Number.isNaN(maxSlippage)) return undefined
  const numerator = Math.floor(Number(maxSlippage) * 100)
  return new Percent(numerator, 10_000)
}

export interface Slippage {
  auto: boolean
  allowed: Percent
  warning?: 'warning' | 'error'
}

export const DEFAULT_SLIPPAGE = {
  auto: true,
  allowed: DEFAULT_AUTO_SLIPPAGE,
}

/** Returns the allowed slippage, and whether it is auto-slippage. */
export default function useSlippage(trade: {
  trade?: InterfaceTrade
  gasUseEstimateUSD?: CurrencyAmount<Token>
}): Slippage {
  const slippage = useAtomValue(slippageAtom)
  const autoSlippage = useAutoSlippageTolerance(slippage.auto ? trade : undefined)
  const maxSlippage = useMemo(() => toPercent(slippage.max), [slippage.max])
  return useMemo(() => {
    const auto = slippage.auto || !slippage.max
    const allowed = slippage.auto ? autoSlippage : maxSlippage ?? autoSlippage
    const warning = auto ? undefined : getSlippageWarning(allowed)
    if (auto && allowed === DEFAULT_AUTO_SLIPPAGE) {
      return DEFAULT_SLIPPAGE
    }
    return { auto, allowed, warning }
  }, [autoSlippage, maxSlippage, slippage])
}

export const MAX_VALID_SLIPPAGE = new Percent(1, 2)
export const MIN_HIGH_SLIPPAGE = new Percent(1, 100)

export function getSlippageWarning(slippage?: Percent): 'warning' | 'error' | undefined {
  if (slippage?.greaterThan(MAX_VALID_SLIPPAGE)) return 'error'
  if (slippage?.greaterThan(MIN_HIGH_SLIPPAGE)) return 'warning'
  return
}

export function formatSlippage(slippage: Slippage): string {
  return formatPriceImpact(slippage.allowed)
}
