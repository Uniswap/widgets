/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import React from 'react'

import { SwapWidget } from '../src'
import { render, RenderResult, waitFor } from '../src/test'

describe('connect', () => {
  // MetaMask uses a 3000ms timeout to detect window.ethereum.
  // Use fake timers to prevent this from slowing tests (without configuring a test-only timeout value).
  jest.useFakeTimers()

  function itPromptsForWalletConnection(renderWidget: () => RenderResult) {
    it('prompts for wallet connection', async () => {
      const widget = renderWidget()
      const connectWallet = await widget.findByTestId('connect-wallet')
      expect(connectWallet.textContent).toBe('Connect wallet to swap')

      const toolbar = await widget.findByTestId('toolbar')
      // The toolbar will reflect eager connection until it fails.
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'), { timeout: 10000 })
      expect(toolbar.textContent).toBe('Connect wallet to swap')
    })
  }

  function itExpectsWidgetToBeEnabled(renderWidget: () => RenderResult) {
    it('widget is enabled', async () => {
      const widget = renderWidget()
      const tokenSelect = (await widget.findAllByTestId('token-select'))[0]
      await waitFor(() => expect(tokenSelect).toHaveProperty('disabled', false))
    })
  }

  describe('with no params', () => {
    const renderWidget = () => render(<SwapWidget />)
    itPromptsForWalletConnection(renderWidget)
    itExpectsWidgetToBeEnabled(renderWidget)
  })

  describe('with jsonRpcUrlMap', () => {
    describe('with an array', () => {
      const renderWidget = () => render(<SwapWidget jsonRpcUrlMap={{ 1: [hardhat.url] }} />)
      itPromptsForWalletConnection(renderWidget)
      itExpectsWidgetToBeEnabled(renderWidget)
    })

    describe('with a singleton', () => {
      const renderWidget = () => render(<SwapWidget jsonRpcUrlMap={{ 1: hardhat.url }} />)
      itPromptsForWalletConnection(renderWidget)
      itExpectsWidgetToBeEnabled(renderWidget)
    })
  })

  describe('with provider', () => {
    const HARDHAT_ACCOUNT_DISPLAY_STRING = `${hardhat.account.address?.substring(
      0,
      6
    )}...${hardhat.account.address?.substring(hardhat.account.address.length - 4)}`

    // The real hardhat.provider relies on real timeouts when providing data.
    jest.useRealTimers()

    const renderWidget = () => render(<SwapWidget provider={hardhat.provider} />)

    it('displays connected account chip', async () => {
      const widget = renderWidget()
      const toolbar = await widget.findByTestId('toolbar')
      // The toolbar will reflect a pending connection until it connects.
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'), { timeout: 10000 })

      widget.rerender(<SwapWidget provider={hardhat.provider} />)
      const account = await widget.findByTestId('account')
      await waitFor(() => expect(account.textContent?.toLowerCase()).toBe(HARDHAT_ACCOUNT_DISPLAY_STRING))
    })

    itExpectsWidgetToBeEnabled(renderWidget)
  })
})
