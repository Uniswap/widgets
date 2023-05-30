import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider, JsonRpcSigner, TransactionRequest, TransactionResponse } from '@ethersproject/providers'

import { sendTransaction } from '.'
import * as Meta from './meta'

jest.mock('./meta')

describe('sendTransaction', () => {
  const getTransaction = jest.fn()
  const sendUncheckedTransaction = jest.fn()
  const request = { calldata: 'test' } as TransactionRequest
  const response = {} as TransactionResponse
  const signer = {
    estimateGas: jest.fn().mockResolvedValue(BigNumber.from(10)),
    sendUncheckedTransaction,
  } as unknown as JsonRpcSigner
  const provider = {
    once: jest.fn(),
    getSigner: jest.fn().mockReturnValue(signer),
    getTransaction,
    _wrapTransaction: jest.fn().mockImplementation((tx) => tx),
  } as unknown as JsonRpcProvider

  beforeEach(() => {
    getTransaction.mockReturnValueOnce(response)
    sendUncheckedTransaction.mockReset()
  })

  it('sends a transaction with no gas margin', async () => {
    await expect(sendTransaction(provider, request)).resolves.toBe(response)
    expect(signer.sendUncheckedTransaction).toHaveBeenCalledWith({ ...request, gasLimit: BigNumber.from(10) })
  })

  it('polls for a response', async () => {
    jest.spyOn(provider, 'once').mockImplementation((name, listener) => {
      listener()
      return provider
    })
    getTransaction.mockReset().mockReturnValueOnce(undefined).mockReturnValueOnce(response)
    await expect(sendTransaction(provider, request)).resolves.toBe(response)
    expect(getTransaction).toHaveBeenCalledTimes(2)
  })

  it('sends a transaction with configured gas margin', async () => {
    await expect(sendTransaction(provider, request, 0.1)).resolves.toBe(response)
    expect(signer.sendUncheckedTransaction).toHaveBeenCalledWith({ ...request, gasLimit: BigNumber.from(11) })
  })

  it('sends a transaction with no gas limit', async () => {
    await expect(sendTransaction(provider, request, 0.1, true)).resolves.toBe(response)
    expect(signer.sendUncheckedTransaction).toHaveBeenCalledWith({ ...request })
  })

  describe('with Uniswap Wallet', () => {
    beforeEach(() => {
      const getWalletMeta = Meta.getWalletMeta as jest.Mock
      getWalletMeta.mockReturnValueOnce({ name: 'Uniswap Wallet' })
      getTransaction.mockReturnValueOnce(response)
    })

    it('sends a transaction with no gas limit', async () => {
      await expect(sendTransaction(provider, request)).resolves.toBe(response)
      expect(signer.sendUncheckedTransaction).toHaveBeenCalledWith({ ...request })
    })
  })
})
