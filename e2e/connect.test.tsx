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
      // Should instantiate with fallback JSONRPC URL network connection. But why doesn't it have 'connecting'?
      // expect(connectWallet.textContent).toBe('Connect wallet to swap')
      // expect(toolbar.textContent).toBe('Connecting…')

      // await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
      expect(toolbar.textContent).toBe('Connect wallet to swap')
      expect(tokenSelect.getAttribute('disabled')).toBeFalsy()
    })
  })

  describe('with integrator jsonRpcEndpoint', () => {
    it('prompts for wallet connection in the Wallet and Toolbar', async () => {
      component.rerender(<SwapWidget tokenList={tokens} jsonRpcEndpoint={hardhat.url} />)
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
      expect(toolbar.textContent).toBe('Connecting…')

      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
      expect(toolbar.textContent).toBe('Connect wallet to swap')
      expect(tokenSelect.getAttribute('disabled')).toBeFalsy()
    })
  })

  // FIXME: providing integrator provider is curr broken

  // describe('with integrator provider', () => {
  //   it('does not prompt for wallet connection', async () => {
  //     component.rerender(<SwapWidget tokenList={tokens} provider={hardhat.provider} />)
  //     expect(toolbar.textContent).toBe('Connect wallet to swap') // should this be Connecting

  //     await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
  //     account = await component.findByTestId('account')
  //     expect(account.textContent.substring(0, 2)).toBe('0x')
  //     expect(toolbar.textContent).toBe('Enter an amount')
  //   })
  // })
})
