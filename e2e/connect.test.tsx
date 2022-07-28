/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import { render, RenderResult, waitFor } from '@testing-library/react'
import { tokens } from '@uniswap/default-token-list'

import { SwapWidget } from '../src'

describe('connect', () => {
  let component: RenderResult
  let account: HTMLElement
  let connectWallet: HTMLElement
  let toolbar: HTMLElement
  let tokenSelect: HTMLElement

  beforeEach(async () => {
    component = render(<SwapWidget tokenList={tokens} />)
    connectWallet = await component.findByTestId('connect-wallet')
    toolbar = await component.findByTestId('toolbar')
    tokenSelect = (await component.findAllByTestId('token-select'))[0]
  })

  describe('with no params, using fallback JSON RPC URL', () => {
    it('prompts for wallet connection in the Toolbar and Wallet', async () => {
      expect(toolbar.textContent).toBe('Connecting…')

      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
      expect(toolbar.textContent).toBe('Connect wallet to swap')
      expect(tokenSelect.getAttribute('disabled')).toBeFalsy()
    })
  })

  describe('with integrator jsonRpcUrlMap', () => {
    it('prompts for wallet connection in the Wallet and Toolbar', async () => {
      component = render(<SwapWidget tokenList={tokens} jsonRpcUrlMap={{ 1: [hardhat.url] }} />)
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
      expect(toolbar.textContent).toBe('Connecting…')

      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
      expect(toolbar.textContent).toBe('Connect wallet to swap')
      expect(tokenSelect.getAttribute('disabled')).toBeFalsy()
    })
  })

  describe('with integrator provider', () => {
    it('does not prompt for wallet connection with hardhat', async () => {
      component = render(<SwapWidget tokenList={tokens} provider={hardhat.provider} />)
      expect(toolbar.textContent).toBe('Connecting…')

      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      account = await component.findByTestId('account')
      toolbar = (await component.findAllByTestId('toolbar'))[1]
      expect(account.textContent.substring(0, 2)).toBe('0x')
      expect(toolbar.textContent).toBe('Enter an amount')
      expect(tokenSelect.getAttribute('disabled')).toBeFalsy()
    })
  })
})
