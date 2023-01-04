import { MAX_VALID_SLIPPAGE } from 'hooks/useSlippage'
import { renderComponent, userEvent } from 'test'

import MaxSlippageSelect from './MaxSlippageSelect'

describe('MaxSlippageSelect', () => {
  it('initially selects auto', async () => {
    const el = renderComponent(<MaxSlippageSelect />)
    const auto = (await el.findByTestId('auto-slippage')) as HTMLOptionElement
    expect(auto.selected).toBeTruthy()
  })

  it('accepts integral input', async () => {
    const el = renderComponent(<MaxSlippageSelect />)
    const custom = (await el.findByTestId('custom-slippage')) as HTMLOptionElement
    const input = (await el.findByTestId('input-slippage')) as HTMLInputElement

    const user = userEvent.setup()
    await user.type(input, '1')

    expect(custom.selected).toBeTruthy()
    expect(input.value).toBe('1')
  })

  it('accepts decimal input', async () => {
    const el = renderComponent(<MaxSlippageSelect />)
    const custom = (await el.findByTestId('custom-slippage')) as HTMLOptionElement
    const input = (await el.findByTestId('input-slippage')) as HTMLInputElement

    const user = userEvent.setup()
    await user.type(input, '1.5')

    expect(custom.selected).toBeTruthy()
    expect(input.value).toBe('1.5')
  })

  it('selects auto slippage when input is invalid', async () => {
    const el = renderComponent(<MaxSlippageSelect />)
    const auto = (await el.findByTestId('auto-slippage')) as HTMLOptionElement
    const input = (await el.findByTestId('input-slippage')) as HTMLInputElement

    const INVALID_SLIPPAGE = '51'
    expect(Number(INVALID_SLIPPAGE)).toBeGreaterThan(Number(MAX_VALID_SLIPPAGE.toFixed()))
    const user = userEvent.setup()
    await user.type(input, INVALID_SLIPPAGE.toString())

    expect(input.value).toBe('51')
    expect(auto.selected).toBeTruthy()
  })
})
