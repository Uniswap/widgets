/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import { SwapWidget } from 'index'
import React, { ReactElement } from 'react'
import { render, waitFor } from 'test'

const HARDHAT_ACCOUNT_DISPLAY_STRING = `${hardhat.account.address?.substring(
  0,
  6
)}...${hardhat.account.address?.substring(hardhat.account.address.length - 4)}`

describe('connect', () => {
  // MetaMask uses a 3000ms timeout to detect window.ethereum.
  // Use fake timers to prevent this from slowing tests (without configuring a test-only timeout value).
  jest.useFakeTimers()

  function itPromptsForWalletConnection(widget: ReactElement) {
    it('prompts for wallet connection', async () => {
      const result = render(widget)
      const connectWallet = await result.findByTestId('connect-wallet')
      expect(connectWallet.textContent).toBe('Connect wallet to swap')

      const toolbar = await result.findByTestId('toolbar')
      expect(toolbar.textContent).toBe('Connect wallet to swap')
    })
  }

  function itExpectsWidgetToBeEnabled(widget: ReactElement) {
    it('widget is enabled', async () => {
      const result = render(widget)
      const tokenSelect = (await result.findAllByTestId('token-select'))[0]
      await waitFor(() => expect(tokenSelect).toHaveProperty('disabled', false))
    })
  }

  describe('with no params', () => {
    const widget = <SwapWidget />
    itPromptsForWalletConnection(widget)
    itExpectsWidgetToBeEnabled(widget)
  })

  describe('with jsonRpcUrlMap', () => {
    describe('with an array', () => {
      const widget = <SwapWidget jsonRpcUrlMap={{ 1: [hardhat.url] }} />
      itPromptsForWalletConnection(widget)
      itExpectsWidgetToBeEnabled(widget)
    })

    describe('with a singleton', () => {
      const widget = <SwapWidget jsonRpcUrlMap={{ 1: hardhat.url }} />
      itPromptsForWalletConnection(widget)
      itExpectsWidgetToBeEnabled(widget)
    })
  })

  describe('with provider', () => {
    // The real hardhat.provider relies on real timeouts when providing data.
    jest.useRealTimers()

    const widget = <SwapWidget provider={hardhat.provider} />
    itExpectsWidgetToBeEnabled(widget)

    it('displays connected account chip', async () => {
      const result = render(widget)
      const toolbar = await result.findByTestId('toolbar')

      // The toolbar will reflect a pending connection until it connects.
      await waitFor(() => expect(toolbar.textContent).not.toContain('Connect'))

      const account = await result.findByTestId('account')
      await waitFor(() => expect(account.textContent?.toLowerCase()).toBe(HARDHAT_ACCOUNT_DISPLAY_STRING))
    })
  })
})
