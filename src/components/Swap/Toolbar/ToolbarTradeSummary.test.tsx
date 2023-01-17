import { renderComponent } from 'test'

import ToolbarTradeSummary from './ToolbarTradeSummary'

describe('ToolbarTradeSummary', () => {
  it('renders correctly, defaults', () => {
    const component = renderComponent(
      <ToolbarTradeSummary
        rows={[
          {
            name: 'Network fee',
            value: '0.0001 USDC',
          },
          {
            name: 'Price impact',
            value: '0.5%',
          },
          {
            name: 'Minimum output after slippage',
            value: '0.9999 DAI',
          },
          {
            name: 'Expected output',
            value: '1.0000 DAI',
          },
        ]}
      />
    )
    expect(component.getByText('Network fee')).toBeTruthy()
    expect(component.getByText('Price impact')).toBeTruthy()
    expect(component.getByText('Minimum output after slippage')).toBeTruthy()
    expect(component.getByText('Expected output')).toBeTruthy()
  })
})
