import { Protocol } from '@uniswap/router-sdk'
import { Currency, Percent } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { InterfaceTrade } from 'state/routing/types'
import { getFeeAmount } from 'utils/prices'
import { isExactInput } from 'utils/tradeType'

export interface RoutingDiagramEntry {
  percent: Percent
  path: [Currency, Currency, FeeAmount][]
  protocol: Protocol
}

/**
 * Loops through all routes on a trade and returns an array of diagram entries.
 */
export function getTokenPath(trade: InterfaceTrade): RoutingDiagramEntry[] {
  return trade.swaps.map(({ route: { path: tokenPath, pools, protocol }, inputAmount, outputAmount }) => {
    const portion = isExactInput(trade.tradeType)
      ? inputAmount.divide(trade.inputAmount)
      : outputAmount.divide(trade.outputAmount)
    const percent = new Percent(portion.numerator, portion.denominator)
    const path: RoutingDiagramEntry['path'] = []
    for (let i = 0; i < pools.length; i++) {
      const nextPool = pools[i]
      const tokenIn = tokenPath[i]
      const tokenOut = tokenPath[i + 1]
      const entry: RoutingDiagramEntry['path'][0] = [tokenIn, tokenOut, getFeeAmount(nextPool)]
      path.push(entry)
    }
    return {
      percent,
      path,
      protocol,
    }
  })
}
