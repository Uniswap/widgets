import { Protocol } from '@uniswap/router-sdk'
import { Currency, Percent } from '@uniswap/sdk-core'
import { Pair, Trade as V2Trade } from '@uniswap/v2-sdk'
import { FeeAmount } from '@uniswap/v3-sdk'
import { ONE_HUNDRED_PERCENT } from 'constants/misc'
import { InterfaceTrade } from 'state/routing/types'
import { isExactInput } from 'utils/tradeType'

export interface RoutingDiagramEntry {
  percent: Percent
  path: [Currency, Currency, FeeAmount][]
  protocol: Protocol
}

const V2_FEE_AMOUNT = FeeAmount.MEDIUM

/**
 * Loops through all routes on a trade and returns an array of diagram entries.
 */
export function getTokenPath(trade: InterfaceTrade): RoutingDiagramEntry[] {
  if (trade instanceof V2Trade) {
    const path: [Currency, Currency, FeeAmount][] = trade.route.pairs.map((pair) => [
      pair.token0,
      pair.token1,
      V2_FEE_AMOUNT,
    ])
    return [{ path, percent: ONE_HUNDRED_PERCENT, protocol: Protocol.V2 }]
  }

  return trade.swaps.map(({ route: { pools }, inputAmount, outputAmount }) => {
    const portion = isExactInput(trade.tradeType)
      ? inputAmount.divide(trade.inputAmount)
      : outputAmount.divide(trade.outputAmount)
    const percent = new Percent(portion.numerator, portion.denominator)
    const path: RoutingDiagramEntry['path'] = []
    let protocol = Protocol.V2
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i]
      const tokenIn = pool.token0
      const tokenOut = pool.token1
      protocol = pool instanceof Pair ? Protocol.V2 : Protocol.V3
      const entry: RoutingDiagramEntry['path'][0] = [tokenIn, tokenOut, pool instanceof Pair ? V2_FEE_AMOUNT : pool.fee]
      path.push(entry)
    }
    return {
      percent,
      path,
      protocol,
    }
  })
}
