/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import userEvent from '@testing-library/user-event'

import { onTokenSelectorClickAtom } from '../../state/swap'
import { renderWidget, waitFor } from '../../test'
import TokenSelect from './'

describe('TokenSelect.tsx', () => {
  describe('onTokenSelectorClick', () => {
    it('should fire the onTokenSelectorClick handler when it exists', async () => {
      const user = userEvent.setup()
      const onTokenSelectorClick = jest.fn()

      const component = renderWidget(
        <TokenSelect value={undefined} collapsed disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await user.click(component.getByRole('button'))
      expect(onTokenSelectorClick).toHaveBeenCalled()
    })
    it('should continue if the handler promise resolves to true', async () => {
      const user = userEvent.setup()

      const onTokenSelectorClick = jest.fn().mockResolvedValueOnce(true)

      const component = renderWidget(
        <TokenSelect value={undefined} collapsed={false} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await user.click(component.getByRole('button'))
      await waitFor(() => expect(component.getAllByText('Select a token').length).toBe(2))
    })
    it('should halt if the handler promise resolves to false', async () => {
      const user = userEvent.setup()

      const onTokenSelectorClick = jest.fn().mockResolvedValueOnce(false)

      const component = renderWidget(
        <TokenSelect value={undefined} collapsed={false} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await user.click(component.getByRole('button'))
      await waitFor(() => expect(component.getAllByText('Select a token').length).toBe(1))
    })
    it('should halt if the handler promise rejects', async () => {
      const user = userEvent.setup()

      const onTokenSelectorClick = jest.fn().mockRejectedValueOnce(false)

      const component = renderWidget(
        <TokenSelect value={undefined} collapsed={false} disabled={false} onSelect={jest.fn()} />,
        {
          initialAtomValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await user.click(component.getByRole('button'))
      await waitFor(() => expect(component.getAllByText('Select a token').length).toBe(1))
    })
  })
})
