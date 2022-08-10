import userEvent from '@testing-library/user-event'
import { MAX_VALID_SLIPPAGE } from 'hooks/useSlippage'
import { act, renderComponent, RenderResult } from 'test'

import MaxSlippageSelect from './MaxSlippageSelect'

describe('MaxSlippageSelect', () => {
  let el: RenderResult
  let auto: HTMLOptionElement
  let custom: HTMLOptionElement
  let input: HTMLInputElement

  beforeEach(async () => {
    el = renderComponent(<MaxSlippageSelect />)
    auto = (await el.findByTestId('auto')) as HTMLOptionElement
    custom = (await el.findByTestId('custom')) as HTMLOptionElement
    input = (await el.findByTestId('input')) as HTMLInputElement
    expect(auto.selected).toBeTruthy()
    expect(input.value).toBe('')
  })

  it('accepts integral input', async () => {
    const user = userEvent.setup()

    await act(async () => user.type(input, '1'))
    expect(custom.selected).toBeTruthy()
    expect(input.value).toBe('1')
  })

  it('accepts decimal input', async () => {
    const user = userEvent.setup()

    await act(async () => user.type(input, '1.5'))
    expect(custom.selected).toBeTruthy()
    expect(input.value).toBe('1.5')
  })

  it('selects auto slippage when input is invalid', async () => {
    const user = userEvent.setup()

    const INVALID_SLIPPAGE = '51'
    expect(Number(INVALID_SLIPPAGE)).toBeGreaterThan(Number(MAX_VALID_SLIPPAGE.toFixed()))

    await act(async () => user.type(input, INVALID_SLIPPAGE.toString()))
    expect(input.value).toBe('51')
    expect(auto.selected).toBeTruthy()
  })
})
