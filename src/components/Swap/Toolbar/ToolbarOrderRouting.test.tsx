import { CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { InterfaceTrade } from 'state/routing/types'
import { renderComponent } from 'test'
import { buildMultiV3Route, buildSingleV3Route, DAI, USDC } from 'test/utils'

import ToolbarOrderRouting from './ToolbarOrderRouting'

describe('ToolbarOrderRouting', () => {
  it('renders correctly, loading', () => {
    const component = renderComponent(<ToolbarOrderRouting />)
    expect(component.getByText('Order routing')).toBeTruthy()
  })

  it('renders correctly, 1 hop', () => {
    const inputAmount = CurrencyAmount.fromRawAmount(USDC, 1)
    const outputAmount = CurrencyAmount.fromRawAmount(DAI, 1)
    const testRoute = buildSingleV3Route(inputAmount, outputAmount)
    const component = renderComponent(
      <ToolbarOrderRouting
        gasUseEstimateUSD={CurrencyAmount.fromRawAmount(DAI, 1)}
        trade={
          new InterfaceTrade({
            v2Routes: [],
            v3Routes: [testRoute],
            tradeType: TradeType.EXACT_INPUT,
          })
        }
      />
    )
    expect(component.getByText('Auto Router')).toBeTruthy()
    expect(component).toMatchSnapshot()
  })

  it('renders correctly, 2 hops', () => {
    const usdc = CurrencyAmount.fromRawAmount(USDC, 1)
    const dai = CurrencyAmount.fromRawAmount(DAI, 1)
    const component = renderComponent(
      <ToolbarOrderRouting
        gasUseEstimateUSD={CurrencyAmount.fromRawAmount(DAI, 1)}
        trade={
          new InterfaceTrade({
            v2Routes: [],
            v3Routes: [buildMultiV3Route(usdc, dai)],
            tradeType: TradeType.EXACT_INPUT,
          })
        }
      />
    )
    expect(component.getByText('Auto Router')).toBeTruthy()
    expect(component).toMatchSnapshot()
  })

  it('renders correctly, 3 hops across 2 swaps', () => {
    const usdc = CurrencyAmount.fromRawAmount(USDC, 1)
    const dai = CurrencyAmount.fromRawAmount(DAI, 1)
    const component = renderComponent(
      <ToolbarOrderRouting
        gasUseEstimateUSD={CurrencyAmount.fromRawAmount(DAI, 1)}
        trade={
          new InterfaceTrade({
            v2Routes: [],
            v3Routes: [buildMultiV3Route(usdc, dai), buildSingleV3Route(usdc, dai)],
            tradeType: TradeType.EXACT_INPUT,
          })
        }
      />
    )
    expect(component.getByText('Auto Router')).toBeTruthy()
    expect(component).toMatchSnapshot()
  })
})
