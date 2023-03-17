import { Percent } from '@uniswap/sdk-core'
import { renderComponent } from 'test'

import { FiatValueChangeRow } from './FiatValueChangeRow'

describe('FiatValueChangeRow', () => {
  it('should display the percentage and icon for an error', () => {
    const el = renderComponent(
      <FiatValueChangeRow
        impact={{
          percent: new Percent(10, 100),
          warning: 'error',
        }}
      />
    )
    // verify that the percentage string is visible
    expect(el.getByText('(10.00%)')).toBeTruthy()
    // verify the tooltip is visible
    const iconElement = el.container.querySelector('svg')
    expect(iconElement).toBeTruthy()
  })

  it('should display the percentage and icon for a warning', () => {
    const el = renderComponent(
      <FiatValueChangeRow
        impact={{
          percent: new Percent(1, 100),
          warning: 'warning',
        }}
      />
    )
    // verify that the percentage string is visible
    expect(el.getByText('(1.00%)')).toBeTruthy()
    // verify the tooltip is visible
    const iconElement = el.container.querySelector('svg')
    expect(iconElement).toBeTruthy()
  })

  it('should display the percentage but no icon for small percentage', () => {
    const el = renderComponent(
      <FiatValueChangeRow
        impact={{
          percent: new Percent(1, 10000),
        }}
      />
    )
    // verify that the percentage string is visible
    expect(el.getByText('(0.01%)')).toBeTruthy()
    // verify the tooltip is visible
    const iconElement = el.container.querySelector('svg')
    expect(iconElement).not.toBeTruthy()
  })
})
