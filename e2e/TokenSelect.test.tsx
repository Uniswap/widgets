/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { USDC_GÖRLI } from '@uniswap/smart-order-router'
import TokenSelect from '../src/components/TokenSelect'

fdescribe('TokenSelect.tsx', () => {
  const currency = USDC_GÖRLI
  const onSelect = jest.fn()
  const user = userEvent.setup()
  describe('onTokenSelectorClick', () => {
    it('should fire a handler if it exists', async () => {
      const component = render(<TokenSelect value={currency} collapsed disabled={false} onSelect={onSelect} />)
      const button = component.getByTestId('TokenButton')
      await user.click(button)
      expect
    })
    it('should support promise resolution', () => {})
    it('should stop the token selector from opening if e.preventDefault is called', () => {})
  })
})
