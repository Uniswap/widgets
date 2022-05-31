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
  let wallet: HTMLElement
  let toolbar: HTMLElement

  beforeEach(async () => {
    component = render(<SwapWidget tokenList={tokens} />)
    wallet = await component.findByTestId('wallet')
    toolbar = await component.findByTestId('toolbar')
  })

  it('prompts for wallet connection in the Toolbar', async () => {
    expect(wallet.hidden).toBeTruthy()
    expect(toolbar.textContent).toBe('Connect wallet to swap')
  })

  describe('with jsonRpcEndpoint', () => {
    it('prompts for wallet connection in the Wallet', async () => {
      component.rerender(<SwapWidget tokenList={tokens} jsonRpcEndpoint={hardhat.url} />)
      expect(wallet.hidden).toBeTruthy()
      expect(toolbar.textContent).toBe('Connecting…')

      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(wallet.hidden).toBeFalsy()
      expect(wallet.textContent).toBe('Connect wallet to swap')
      expect(toolbar.textContent).toBe('Enter an amount')
    })
  })

  describe('with provider', () => {
    it('does not prompt for wallet connection', async () => {
      component.rerender(<SwapWidget tokenList={tokens} provider={hardhat.provider} />)
      expect(wallet.hidden).toBeTruthy()
      expect(toolbar.textContent).toBe('Connecting…')

      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(wallet.hidden).toBeTruthy()
      expect(toolbar.textContent).toBe('Enter an amount')
    })
  })
})
