import '@ethersproject/providers'

import { JsonRpcProvider } from '@ethersproject/providers'
import { act, render, RenderResult } from '@testing-library/react'
import { tokens } from '@uniswap/default-token-list'

import { SwapWidget } from '../src'

const JSON_RPC_ENDPOINT = 'http://127.0.0.1:8545/'
const provider = new JsonRpcProvider('http://127.0.0.1:8545/')

class MockPromise<T = void> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: () => void
  value: T
  error: unknown
  settled = false

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
      .then((value) => {
        this.value = value
      })
      .catch((error) => {
        this.error = error
      })
      .finally(() => {
        this.settled = true
      })
  }
}

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
      const onConnect = new MockPromise()
      component.rerender(
        <SwapWidget tokenList={tokens} jsonRpcEndpoint={JSON_RPC_ENDPOINT} onConnect={onConnect.resolve} />
      )
      expect(wallet.hidden).toBeTruthy()
      expect(toolbar.textContent).toBe('Connecting…')

      await act(() => onConnect.promise)
      expect(wallet.hidden).toBeFalsy()
      expect(toolbar.textContent).toBe('Enter an amount')
    })
  })

  describe('with provider', () => {
    it('does not prompt for wallet connection', async () => {
      const onConnect = new MockPromise()
      component.rerender(<SwapWidget tokenList={tokens} provider={provider} onConnect={onConnect.resolve} />)
      expect(wallet.hidden).toBeTruthy()
      expect(toolbar.textContent).toBe('Connect wallet to swap')

      await act(() => onConnect.promise)
      expect(wallet.hidden).toBeTruthy()
      expect(toolbar.textContent).toBe('Enter an amount')
    })
  })
})
