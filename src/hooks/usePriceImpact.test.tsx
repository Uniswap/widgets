import { formatPriceImpact } from '@uniswap/conedison/format'
import { CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { InterfaceTrade } from 'state/routing/types'
import { renderHook } from 'test'
import { buildSingleV3Route, DAI, USDC } from 'test/utils'

import { usePriceImpact } from './usePriceImpact'

const usdc = CurrencyAmount.fromRawAmount(USDC, 1)
const dai = CurrencyAmount.fromRawAmount(DAI, 1)

describe('usePriceImpact', () => {
  it('returns price impact warning for a low liquidity pool', () => {
    const trade: InterfaceTrade = new InterfaceTrade({
      v2Routes: [],
      v3Routes: [buildSingleV3Route(usdc, dai)],
      tradeType: TradeType.EXACT_INPUT,
    })
    const { result } = renderHook(() => usePriceImpact(trade))
    expect(formatPriceImpact(result.current?.percent)).toEqual('99.61%')
    expect(result.current?.warning).toEqual('error')
  })
})
