/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import { onTokenSelectorClickAtom } from '../../state/swap'
import { renderWidget, user } from '../../test'
import TokenSelect from './'

describe('TokenSelect.tsx', () => {
  describe('onTokenSelectorClick', () => {
    it('should fire the onTokenSelectorClick handler when it exists', async () => {
      const onTokenSelectorClick = jest.fn()

      const component = renderWidget(
        <TokenSelect value={undefined} collapsed disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await user.click(component.getByTestId('token-select'))
      expect(onTokenSelectorClick).toHaveBeenCalled()
    })

    it('should continue if the handler promise resolves to true', async () => {
      const onTokenSelectorClick = jest.fn().mockResolvedValueOnce(true)

      const component = renderWidget(
        <TokenSelect value={undefined} collapsed={false} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await user.click(component.getByTestId('token-select'))
      await expect(component.findByTestId('token-select-dialog')).resolves.toBeTruthy()
    })

    it('should halt if the handler promise resolves to false', async () => {
      const onTokenSelectorClick = jest.fn().mockResolvedValueOnce(false)

      const component = renderWidget(
        <TokenSelect value={undefined} collapsed={false} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await user.click(component.getByTestId('token-select'))
      await expect(component.findByTestId('token-select-dialog')).rejects.toThrow()
    })

    it('should halt if the handler promise rejects', async () => {
      const onTokenSelectorClick = jest.fn().mockRejectedValueOnce(false)

      const component = renderWidget(
        <TokenSelect value={undefined} collapsed={false} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await user.click(component.getByTestId('token-select'))
      await expect(component.findByTestId('token-select-dialog')).rejects.toThrow()
    })
  })
})
