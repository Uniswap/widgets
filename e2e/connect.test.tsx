/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import { SwapWidget } from 'index'
import React, { ReactElement } from 'react'

import { cleanup, render, waitFor } from './test'

const HARDHAT_ACCOUNT_DISPLAY_STRING = `${hardhat.account.address?.substring(
  0,
  6
)}...${hardhat.account.address?.substring(hardhat.account.address.length - 4)}`

// We are testing different configurations of the widget, so we must run cleanup between tests.
afterEach(cleanup)

describe('connect', () => {
  // MetaMask uses a 3000ms timeout to detect window.ethereum.
  // Use fake timers to prevent this from slowing tests.
  jest.useFakeTimers()

  function itPromptsForWalletConnection(ui: ReactElement) {
    it('prompts for wallet connection', async () => {
      const widget = render(ui)
      expect((await widget.findByTestId('connect-wallet')).textContent).toBe('Connect wallet')
    })
  }

  function itExpectsWidgetToBeEnabled(ui: ReactElement) {
    it('widget is enabled', async () => {
      const widget = render(ui)
      const tokenSelects = await widget.findAllByTestId('token-select')
      await waitFor(() => tokenSelects.forEach((tokenSelect) => expect(tokenSelect).toHaveProperty('disabled', false)))
    })
  }

  describe('with no params', () => {
    const ui = <SwapWidget />
    itPromptsForWalletConnection(ui)
    itExpectsWidgetToBeEnabled(ui)
  })

  describe('with jsonRpcUrlMap', () => {
    describe('with an array', () => {
      const ui = <SwapWidget jsonRpcUrlMap={{ 1: [hardhat.url] }} />
      itPromptsForWalletConnection(ui)
      itExpectsWidgetToBeEnabled(ui)
    })

    describe('with a singleton', () => {
      const ui = <SwapWidget jsonRpcUrlMap={{ 1: hardhat.url }} />
      itPromptsForWalletConnection(ui)
      itExpectsWidgetToBeEnabled(ui)
    })
  })

  describe('with provider', () => {
    // The real hardhat.provider relies on real timeouts when providing data.
    jest.useRealTimers()

    const ui = <SwapWidget provider={hardhat.provider} />
    itExpectsWidgetToBeEnabled(ui)

    it('displays connected account chip', async () => {
      const widget = render(ui)
      await waitFor(() =>
        expect(widget.getByTestId('account').textContent?.toLowerCase()).toBe(HARDHAT_ACCOUNT_DISPLAY_STRING)
      )
    })
  })
})
