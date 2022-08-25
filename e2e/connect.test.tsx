/**
 * @jest-environment hardhat/dist/jsdom
 */

import '@ethersproject/providers'
import 'jest-environment-hardhat'

import { waitFor } from '@testing-library/react'
import { tokens } from '@uniswap/default-token-list'
import React from 'react'

import { SwapWidget } from '../src'
import { renderWidget } from '../src/test'

const HARDHAT_ACCOUNT_DISPLAY_STRING = `${hardhat.account.address?.substring(
  0,
  6
)}...${hardhat.account.address?.substring(hardhat.account.address.length - 4)}`

describe('connect', () => {
  describe('with no params, using fallback JSON RPC URL', () => {
    it('prompts for wallet connection in the Wallet and Toolbar', async () => {
      const component = renderWidget(<SwapWidget tokenList={tokens} />)
      const toolbar = await component.findByTestId('toolbar')
      expect(toolbar.textContent).toBe('Connect wallet to swap')
      const connectWallet = await component.findByTestId('connect-wallet')
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
    })

    it('expects widget not to be disabled', async () => {
      const component = renderWidget(<SwapWidget tokenList={tokens} />)
      const tokenSelect = (await component.findAllByTestId('token-select'))[0]
      await waitFor(() => {
        expect(tokenSelect).toHaveProperty('disabled', false)
      })
    })
  })

  describe('with valid jsonRpcUrlMap', () => {
    it('prompts for wallet connection in the Wallet and Toolbar', async () => {
      const component = renderWidget(<SwapWidget tokenList={tokens} jsonRpcUrlMap={{ 1: [hardhat.url] }} />)
      const connectWallet = await component.findByTestId('connect-wallet')
      const toolbar = await component.findByTestId('toolbar')
      expect(connectWallet.textContent).toBe('Connect wallet to swap')
      expect(toolbar.textContent).toBe('Connect wallet to swap')
    })

    it('expects widget not to be disabled', async () => {
      const component = renderWidget(<SwapWidget tokenList={tokens} jsonRpcUrlMap={{ 1: [hardhat.url] }} />)
      let tokenSelect = (await component.findAllByTestId('token-select'))[0]
      expect(tokenSelect).toHaveProperty('disabled', true)
      const toolbar = await component.findByTestId('toolbar')
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      tokenSelect = (await component.findAllByTestId('token-select'))[0]
      await waitFor(() => expect(tokenSelect).toHaveProperty('disabled', false))
    })

    describe('with singleton jsonRpcUrlMap', () => {
      it('expects widget not to be disabled', async () => {
        const component = renderWidget(<SwapWidget tokenList={tokens} jsonRpcUrlMap={{ 1: hardhat.url }} />)
        let tokenSelect = (await component.findAllByTestId('token-select'))[0]
        expect(tokenSelect).toHaveProperty('disabled', true)
        const toolbar = await component.findByTestId('toolbar')
        await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
        tokenSelect = (await component.findAllByTestId('token-select'))[0]
        await waitFor(() => expect(tokenSelect).toHaveProperty('disabled', false))
      })
    })
  })

  describe('with wallet provider', () => {
    it('displays connected account chip', async () => {
      const component = renderWidget(<SwapWidget tokenList={tokens} provider={hardhat.provider} />)
      const toolbar = await component.findByTestId('toolbar')
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      const account = await component.findByTestId('account')
      await waitFor(() => expect(account.textContent?.toLowerCase()).toBe(HARDHAT_ACCOUNT_DISPLAY_STRING))
    })

    it('expects widget not to be disabled', async () => {
      const component = renderWidget(<SwapWidget tokenList={tokens} provider={hardhat.provider} />)
      const toolbar = await component.findByTestId('toolbar')
      await waitFor(() => expect(toolbar.textContent).not.toBe('Connecting…'))
      const tokenSelect = (await component.findAllByTestId('token-select'))[0]
      await waitFor(() => expect(tokenSelect).toHaveProperty('disabled', false))
    })
  })
})
