/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import { act, render, RenderResult, waitFor } from '@testing-library/react'
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
    expect(toolbar.textContent).toBe('Connecting…')

    await act(async () => await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…')))
    expect(wallet.textContent).toBe('Connect wallet to swap')
    expect(toolbar.textContent).toBe('Connect wallet to swap')
  })

  describe('with jsonRpcUrlMap', () => {
    it('prompts for wallet connection in the Wallet', async () => {
      act(() => component.rerender(<SwapWidget tokenList={tokens} jsonRpcUrlMap={{ 1: [hardhat.url] }} />))
      expect(toolbar.textContent).toBe('Connecting…')

      await act(async () => await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'), { timeout: 3000 }))
      expect(wallet.textContent).toBe('Connect wallet to swap')
      expect(toolbar.textContent).toBe('Connect wallet to swap')
    })
  })

  // FIXME: broken tests
  // describe('with provider', () => {
  //   jest.setTimeout(100000)
  //   it('does not prompt for wallet connection', async () => {
  //     act(() => component.rerender(<SwapWidget tokenList={tokens} provider={hardhat.provider} />))
  //     expect(toolbar.textContent).toBe('Connecting…')

  //     await act(async () => await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'), { timeout: 3000 }))
  //     expect(toolbar.textContent).toBe('Enter an amount')
  //   })
  // })
})
