import { TransactionRequest } from '@ethersproject/abstract-provider'
import { VoidSigner } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract, ContractTransaction } from '@ethersproject/contracts'
import { Deferrable } from '@ethersproject/properties'
import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { CurrencyAmount, MaxUint256 } from '@uniswap/sdk-core'
import ERC20_ABI from 'abis/erc20.json'
import { SupportedChainId } from 'constants/chains'
import { UNI } from 'constants/tokens'
import { useSingleCallResult } from 'hooks/multicall'
import { useTokenContract } from 'hooks/useContract'
import { swapEventHandlersAtom } from 'state/swap'
import { ApprovalTransactionInfo, TransactionType } from 'state/transactions'
import { renderHook } from 'test'

import { useTokenAllowance, useUpdateTokenAllowance } from './useTokenAllowance'

const TOKEN = UNI[SupportedChainId.MAINNET]
const OWNER = hardhat.account.address
const SPENDER = PERMIT2_ADDRESS
const SIGNER = new VoidSigner(OWNER)

const CONTRACT = new (class extends Contract {
  // approve cannot be spied on; it must be mocked instead
  mockApprove(...args: unknown[]) {
    throw new Error('mocked function; unimplemented')
  }
  approve(...args: unknown[]) {
    return this.mockApprove(args)
  }
})(TOKEN.address, ERC20_ABI) as Contract

const NO_ALLOWANCE = CurrencyAmount.fromRawAmount(TOKEN, 0)
const FULL_ALLOWANCE = CurrencyAmount.fromRawAmount(TOKEN, MaxUint256)

jest.mock('hooks/multicall')
jest.mock('hooks/useContract')
const mockUseTokenContract = useTokenContract as jest.Mock
const mockUseSingleCallResult = useSingleCallResult as jest.Mock

describe('useTokenAllowance', () => {
  const FETCH_DEFAULT_FREQ = { blocksPerFetch: undefined }
  const FETCH_EVERY_BLOCK = { blocksPerFetch: 1 }

  beforeEach(() => mockUseTokenContract.mockReturnValue(CONTRACT))

  describe('with allowance not loaded', () => {
    beforeEach(() => mockUseSingleCallResult.mockReturnValue({ syncing: false }))

    it('fetches allowance', () => {
      const { result } = renderHook(() => useTokenAllowance(TOKEN, OWNER, SPENDER))
      expect(useSingleCallResult).toHaveBeenCalledWith(CONTRACT, 'allowance', [OWNER, SPENDER], FETCH_DEFAULT_FREQ)
      expect(result.current).toMatchObject({ tokenAllowance: undefined })
    })
  })

  describe('with no allowance', () => {
    beforeEach(() => mockUseSingleCallResult.mockReturnValue({ result: BigNumber.from(0), syncing: false }))

    it('refetches allowance every block - this ensures an allowance is "seen" on the block that it is granted', () => {
      const { result, rerender } = renderHook(() => useTokenAllowance(TOKEN, OWNER, SPENDER))
      expect(useSingleCallResult).toHaveBeenCalledWith(CONTRACT, 'allowance', [OWNER, SPENDER], FETCH_EVERY_BLOCK)
      expect(result.current).toMatchObject({ tokenAllowance: NO_ALLOWANCE, isSyncing: false })

      mockUseSingleCallResult.mockReturnValue({ result: BigNumber.from(0), syncing: true })
      rerender()
      expect(result.current).toMatchObject({ tokenAllowance: NO_ALLOWANCE, isSyncing: true })
    })
  })

  describe('with allowance', () => {
    beforeEach(() =>
      mockUseSingleCallResult.mockReturnValue({ result: BigNumber.from(MaxUint256.toString()), syncing: false })
    )

    it('fetches allowance', () => {
      const { result, rerender } = renderHook(() => useTokenAllowance(TOKEN, OWNER, SPENDER))
      expect(useSingleCallResult).toHaveBeenCalledWith(CONTRACT, 'allowance', [OWNER, SPENDER], FETCH_DEFAULT_FREQ)
      expect(result.current).toMatchObject({ tokenAllowance: FULL_ALLOWANCE, isSyncing: false })

      mockUseSingleCallResult.mockReturnValue({ result: BigNumber.from(MaxUint256.toString()), syncing: true })
      rerender()
      expect(result.current).toMatchObject({ tokenAllowance: FULL_ALLOWANCE, isSyncing: true })
    })
  })
})

describe('useUpdateTokenAllowance', () => {
  const APPROVE_TRANSACTION = { __brand: 'approve_transaction' } as unknown as ContractTransaction
  const APPROVAL_TRANSACTION_INFO: ApprovalTransactionInfo = {
    response: APPROVE_TRANSACTION,
    spenderAddress: SPENDER,
    tokenAddress: TOKEN.address,
    type: TransactionType.APPROVAL,
  }

  let estimateGas: jest.SpiedFunction<(transaction: Deferrable<TransactionRequest>) => Promise<BigNumber>>
  let approve: jest.SpiedFunction<(...args: unknown[]) => Promise<ContractTransaction>>

  beforeEach(() => {
    mockUseTokenContract.mockReturnValue(CONTRACT.connect(SIGNER))
    estimateGas = jest.spyOn(SIGNER, 'estimateGas').mockResolvedValue(BigNumber.from(100))
    approve = jest.spyOn(Object.getPrototypeOf(CONTRACT), 'mockApprove').mockResolvedValue(APPROVE_TRANSACTION)
  })

  it('sends approval to wallet', async () => {
    const { result } = renderHook(() => useUpdateTokenAllowance(FULL_ALLOWANCE, SPENDER))
    expect(result.current).toBeInstanceOf(Function)

    const info = await result.current()
    expect(info).toMatchObject(APPROVAL_TRANSACTION_INFO)
    expect(approve).toHaveBeenCalledWith([
      SPENDER,
      MaxUint256.toString(),
      { gasLimit: BigNumber.from(120) }, // gasLimit should be multiplied by 6/5
    ])
  })

  it('triggers onTokenAllowance', async () => {
    const onTokenAllowance = jest.fn()
    const { result } = renderHook(() => useUpdateTokenAllowance(FULL_ALLOWANCE, SPENDER), {
      initialAtomValues: [[swapEventHandlersAtom, { onTokenAllowance }]],
    })
    await result.current()
    expect(onTokenAllowance).toHaveBeenCalledWith(
      expect.objectContaining({ token: TOKEN, spender: SPENDER }),
      expect.any(Promise)
    )
    await expect(onTokenAllowance.mock.calls[0][1]).resolves.toMatchObject(APPROVAL_TRANSACTION_INFO)
  })

  it('falls back to a the amount in case the token restricts approval amounts', async () => {
    estimateGas.mockRejectedValueOnce(new Error())

    const { result } = renderHook(() => useUpdateTokenAllowance(CurrencyAmount.fromRawAmount(TOKEN, 42), SPENDER))
    expect(result.current).toBeInstanceOf(Function)

    const info = await result.current()
    expect(info).toMatchObject(APPROVAL_TRANSACTION_INFO)
    expect(approve).toHaveBeenCalledWith([
      SPENDER,
      '42',
      { gasLimit: BigNumber.from(120) }, // gasLimit should be multiplied by 6/5
    ])
  })

  it('rejects on failure', async () => {
    approve.mockRejectedValueOnce(new Error('test error'))
    const { result } = renderHook(() => useUpdateTokenAllowance(FULL_ALLOWANCE, SPENDER))
    expect(result.current).toBeInstanceOf(Function)

    await expect(() => result.current()).rejects.toThrow(`${TOKEN.symbol} token allowance failed: test error`)
  })
})
