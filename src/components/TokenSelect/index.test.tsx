/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import { Field, swapEventHandlersAtom } from '../../state/swap'
import { renderWidget, userEvent } from '../../test'
import TokenSelect from './'

describe('TokenSelect.tsx', () => {
  describe('onTokenSelectorClick', () => {
    it('should fire the onTokenSelectorClick handler when it exists', async () => {
      const user = userEvent.setup()
      const onTokenSelectorClick = jest.fn()

      const component = renderWidget(
        <TokenSelect field={Field.INPUT} value={undefined} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[swapEventHandlersAtom, { onTokenSelectorClick }]],
        }
      )

      await user.click(component.getByRole('button'))
      expect(onTokenSelectorClick).toHaveBeenCalledWith(Field.INPUT)
    })
    it('should continue if the handler promise resolves to true', async () => {
      const user = userEvent.setup()

      const onTokenSelectorClick = jest.fn().mockResolvedValueOnce(true)

      const component = renderWidget(
        <TokenSelect field={Field.INPUT} value={undefined} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[swapEventHandlersAtom, { onTokenSelectorClick }]],
        }
      )

      await user.click(component.getByRole('button'))
      expect(component.getByTestId('dialog-header').textContent).toBe('Select a token')
    })
    it('should halt if the handler promise resolves to false', async () => {
      const user = userEvent.setup()

      const onTokenSelectorClick = jest.fn().mockResolvedValueOnce(false)

      const component = renderWidget(
        <TokenSelect field={Field.INPUT} value={undefined} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[swapEventHandlersAtom, { onTokenSelectorClick }]],
        }
      )

      await user.click(component.getByRole('button'))
      expect(() => component.getByTestId('dialog-header')).toThrow()
    })
    it('should halt if the handler promise rejects', async () => {
      const user = userEvent.setup()

      const onTokenSelectorClick = jest.fn().mockRejectedValueOnce(false)

      const component = renderWidget(
        <TokenSelect field={Field.INPUT} value={undefined} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[swapEventHandlersAtom, { onTokenSelectorClick }]],
        }
      )

      await user.click(component.getByRole('button'))
      expect(() => component.getByTestId('dialog-header')).toThrow()
    })
  })
})
