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
    it('prompts for wallet connection in the Wallet', async () => {
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
    })
    it('prompts for wallet connection in the Toolbar', async () => {
      expect(toolbar.textContent).toBe('Connecting…')
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(toolbar.textContent).toBe('Connect wallet to swap')
    })
    it('expects widget not to be disabled', async () => {
      expect(tokenSelect).toHaveProperty('disabled', true)
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(tokenSelect).toHaveProperty('disabled', false)
    })
  })

  describe('with valid integrator jsonRpcUrlMap', () => {
    it('prompts for wallet connection in the Wallet', async () => {
      component = render(<SwapWidget tokenList={tokens} jsonRpcUrlMap={{ 1: [hardhat.url] }} />)
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
    })
    it('prompts for wallet connection in the Toolbar', async () => {
      component = render(<SwapWidget tokenList={tokens} jsonRpcUrlMap={{ 1: [hardhat.url] }} />)
      expect(toolbar.textContent).toBe('Connecting…')
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(toolbar.textContent).toBe('Connect wallet to swap')
    })
    it('expects widget not to be disabled', async () => {
      component = render(<SwapWidget tokenList={tokens} jsonRpcUrlMap={{ 1: [hardhat.url] }} />)
      expect(tokenSelect).toHaveProperty('disabled', true)
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(tokenSelect).toHaveProperty('disabled', false)
    })
  })

  describe('with integrator wallet provider', () => {
    it('displays connected account chip', async () => {
      component = render(<SwapWidget tokenList={tokens} provider={hardhat.provider} />)
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      account = await component.findByTestId('account')
      expect(account.textContent?.toLowerCase()).toBe(
        `${hardhat.account.address?.substring(0, 6)}...${hardhat.account.address?.substring(
          hardhat.account.address.length - 4
        )}`
      )
    })
    it('does not prompt for wallet connection in toolbar', async () => {
      component = render(<SwapWidget tokenList={tokens} provider={hardhat.provider} />)
      expect(toolbar.textContent).toBe('Connecting…')
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      toolbar = (await component.findAllByTestId('toolbar'))[1]
      expect(toolbar.textContent).toBe('Enter an amount')
    })
    it('expects widget not to be disabled', async () => {
      component = render(<SwapWidget tokenList={tokens} provider={hardhat.provider} />)
      expect(tokenSelect).toHaveProperty('disabled', true)
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      expect(tokenSelect).toHaveProperty('disabled', false)
    })
  })
})
