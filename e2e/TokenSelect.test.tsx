/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import userEvent from '@testing-library/user-event'
import { onTokenSelectorClickAtom } from '../src/state/swap'
import { render, waitFor } from '../test/test-utils'

import React from 'react'

import TokenSelect from '../src/components/TokenSelect'

describe('TokenSelect.tsx', () => {
  describe('onTokenSelectorClick', () => {
    it('should fire the onTokenSelectorClick handler when it exists', async () => {
      const user = userEvent.setup()
      const onTokenSelectorClick = jest.fn()

      const component = render(<TokenSelect value={undefined} collapsed disabled={false} onSelect={jest.fn()} />, {
        atomProviderInitialValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
      })

      await waitFor(() => expect(hardhat.accounts.length).not.toBe(0))

      await user.click(component.getByRole('button'))
      expect(onTokenSelectorClick).toHaveBeenCalled()
    })
    it('should continue if the handler promise resolves to true', async () => {
      const user = userEvent.setup()

      const onTokenSelectorClick = jest.fn().mockResolvedValueOnce(true)

      const component = render(
        <TokenSelect value={undefined} collapsed={false} disabled={false} onSelect={jest.fn()} />,
        {
          atomProviderInitialValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await waitFor(() => expect(hardhat.accounts.length).not.toBe(0))
      await user.click(component.getByRole('button'))
      await waitFor(() => expect(component.getAllByText('Select a token').length).toBe(2))
    })
    it('should halt if the handler promise resolves to false', async () => {
      const user = userEvent.setup()

      const onTokenSelectorClick = jest.fn().mockResolvedValueOnce(false)

      const component = render(
        <TokenSelect value={undefined} collapsed={false} disabled={false} onSelect={jest.fn()} />,
        {
          atomProviderInitialValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await waitFor(() => expect(hardhat.accounts.length).not.toBe(0))
      await user.click(component.getByRole('button'))
      await waitFor(() => expect(component.getAllByText('Select a token').length).toBe(1))
    })
    it('should halt if the handler promise rejects', async () => {
      const user = userEvent.setup()

      const onTokenSelectorClick = jest.fn().mockRejectedValueOnce(false)

      const component = render(
        <TokenSelect value={undefined} collapsed={false} disabled={false} onSelect={jest.fn()} />,
        {
          atomProviderInitialValues: [[onTokenSelectorClickAtom, onTokenSelectorClick]],
        }
      )

      await waitFor(() => expect(hardhat.accounts.length).not.toBe(0))
      await user.click(component.getByRole('button'))
      await waitFor(() => expect(component.getAllByText('Select a token').length).toBe(1))
    })
  })
})
