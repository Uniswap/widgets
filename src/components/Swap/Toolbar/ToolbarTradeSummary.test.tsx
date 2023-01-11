import { CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { ALLOWED_PRICE_IMPACT_LOW } from 'constants/misc'
import { USDC_MAINNET } from 'constants/tokens'
import { InterfaceTrade } from 'state/routing/types'
import { renderComponent } from 'test'
import { buildSingleV3Route, DAI, USDC } from 'test/utils'

import ToolbarTradeSummary from './ToolbarTradeSummary'

const defaultSlippage = { auto: true, allowed: new Percent(5, 100) }
const defaultImpact = { percent: ALLOWED_PRICE_IMPACT_LOW, toString: () => '0.5%' }

describe('ToolbarTradeSummary', () => {
  it('renders correctly, defaults', () => {
    const inputAmount = CurrencyAmount.fromRawAmount(USDC, 1)
    const outputAmount = CurrencyAmount.fromRawAmount(DAI, 1)
    const testRoute = buildSingleV3Route(inputAmount, outputAmount)
    const component = renderComponent(
      <ToolbarTradeSummary
        slippage={defaultSlippage}
        impact={defaultImpact}
        gasUseEstimateUSD={CurrencyAmount.fromRawAmount(USDC_MAINNET, 1)}
        trade={
          new InterfaceTrade({
            v2Routes: [],
            v3Routes: [testRoute],
            tradeType: TradeType.EXACT_INPUT,
          })
        }
      />
    )
    expect(component.getByText('Network fee')).toBeTruthy()
    expect(component.getByText('Price impact')).toBeTruthy()
    expect(component.getByText('Minimum output after slippage')).toBeTruthy()
    expect(component.getByText('Expected output')).toBeTruthy()
  })
})
