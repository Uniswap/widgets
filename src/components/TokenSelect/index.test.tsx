import '@ethersproject/providers'
import 'jest-environment-hardhat'

import { Field, OnTokenSelectorClick, swapEventHandlersAtom } from 'state/swap'
import { renderComponent, userEvent } from 'test'

import TokenSelect from './'

describe('TokenSelect.tsx', () => {
  describe('onTokenSelectorClick', () => {
    function renderTokenSelect(onTokenSelectorClick: OnTokenSelectorClick) {
      return renderComponent(
        <TokenSelect field={Field.INPUT} value={undefined} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[swapEventHandlersAtom, { onTokenSelectorClick }]],
        }
      )
    }

    it('should fire the onTokenSelectorClick handler when it exists', async () => {
      const user = userEvent.setup()
      const onTokenSelectorClick = jest.fn()
      const widget = renderTokenSelect(onTokenSelectorClick)

      await user.click(widget.getByRole('button'))
      expect(onTokenSelectorClick).toHaveBeenCalledWith(Field.INPUT)
    })
    it('should continue if the handler promise resolves to true', async () => {
      const user = userEvent.setup()
      const onTokenSelectorClick = jest.fn().mockResolvedValueOnce(true)
      const widget = renderTokenSelect(onTokenSelectorClick)

      await user.click(widget.getByRole('button'))
      expect(widget.getByTestId('dialog-header').textContent).toBe('Select token')
    })
    it('should halt if the handler promise resolves to false', async () => {
      const user = userEvent.setup()
      const onTokenSelectorClick = jest.fn().mockResolvedValueOnce(false)
      const widget = renderTokenSelect(onTokenSelectorClick)

      await user.click(widget.getByRole('button'))
      expect(() => widget.getByTestId('dialog-header')).toThrow()
    })
    it('should halt if the handler promise rejects', async () => {
      const user = userEvent.setup()
      const onTokenSelectorClick = jest.fn().mockRejectedValueOnce(false)
      const widget = renderTokenSelect(onTokenSelectorClick)

      await user.click(widget.getByRole('button'))
      expect(() => widget.getByTestId('dialog-header')).toThrow()
    })
  })
})
