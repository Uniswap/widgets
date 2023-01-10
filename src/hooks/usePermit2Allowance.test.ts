import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { CurrencyAmount, MaxUint256 } from '@uniswap/sdk-core'
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { SupportedChainId } from 'constants/chains'
import { UNI } from 'constants/tokens'
import { useAddTransactionInfo, usePendingApproval } from 'hooks/transactions'
import { usePermitAllowance, useUpdatePermitAllowance } from 'hooks/usePermitAllowance'
import { useTokenAllowance, useUpdateTokenAllowance } from 'hooks/useTokenAllowance'
import ms from 'ms.macro'
import { act, renderHook } from 'test'

import usePermit2Allowance, { AllowanceRequired, AllowanceState } from './usePermit2Allowance'

const SPENDER = UNIVERSAL_ROUTER_ADDRESS(SupportedChainId.MAINNET)

const TOKEN = UNI[SupportedChainId.MAINNET]
const AMOUNT = CurrencyAmount.fromRawAmount(TOKEN, MaxUint256.toString())

jest.mock('hooks/useTokenAllowance')
jest.mock('hooks/usePermitAllowance')
jest.mock('hooks/transactions')
const mockUseTokenAllowance = useTokenAllowance as jest.Mock
const mockUseUpdateTokenAllowance = useUpdateTokenAllowance as jest.Mock
const mockUsePermitAllowance = usePermitAllowance as jest.Mock
const mockUseUpdatePermitAllowance = useUpdatePermitAllowance as jest.Mock
const mockUseAddTransactionInfo = useAddTransactionInfo as jest.Mock
const mockUsePendingApproval = usePendingApproval as jest.Mock

const addressMatcher = expect.stringMatching(new RegExp(hardhat.account.address, 'i'))

beforeEach(jest.resetAllMocks)

describe('usePermit2Allowance', () => {
  beforeEach(() => {
    mockUseTokenAllowance.mockReturnValue({ tokenAllowance: undefined })
    mockUsePermitAllowance.mockReturnValue({ permitAllowance: undefined })
  })

  describe('with no token', () => {
    it('defaults to allowed', () => {
      const { result } = renderHook(() => usePermit2Allowance())
      expect(result.current).toMatchObject({ state: AllowanceState.ALLOWED })
    })
  })

  it('loads', async () => {
    const { result } = renderHook(() => usePermit2Allowance(AMOUNT, SPENDER))
    await act(() => hardhat.provider.getNetwork()) // activate hardhat connector
    expect(useTokenAllowance).toHaveBeenCalledWith(TOKEN, addressMatcher, PERMIT2_ADDRESS)
    expect(usePermitAllowance).toHaveBeenCalledWith(TOKEN, addressMatcher, SPENDER)
    expect(result.current).toMatchObject({ state: AllowanceState.LOADING })
  })

  describe('approves', () => {
    const ZERO_ALLOWANCE = CurrencyAmount.fromRawAmount(TOKEN, 0)
    const SIGNATURE = 'signature'
    const NONCE = 42
    const DEADLINE = Math.floor((Date.now() + ms`1m`) / 1000)

    beforeEach(() => {
      mockUseTokenAllowance.mockReturnValue({ tokenAllowance: ZERO_ALLOWANCE })
      mockUsePermitAllowance.mockReturnValue({ permitAllowance: ZERO_ALLOWANCE, nonce: NONCE })
    })

    it('tracks token allowance', async () => {
      mockUseUpdatePermitAllowance.mockImplementation((token, spender, nonce, onPermitSignature) => () => {
        onPermitSignature({
          signature: SIGNATURE,
          sigDeadline: DEADLINE,
          details: {
            token: TOKEN.address,
          },
          spender: SPENDER,
        })
      })

      const info = { __brand: 'info' }
      const addTransactionInfo = jest.fn()
      const updateTokenAllowance = jest.fn().mockResolvedValue(info)
      mockUseUpdateTokenAllowance.mockReturnValue(updateTokenAllowance)
      mockUseAddTransactionInfo.mockReturnValue(addTransactionInfo)

      const { result, rerender } = renderHook(() => usePermit2Allowance(AMOUNT, SPENDER))
      await act(() => hardhat.provider.getNetwork()) // activate hardhat connector
      expect(useUpdateTokenAllowance).toHaveBeenCalledWith(AMOUNT, PERMIT2_ADDRESS)
      expect(useUpdatePermitAllowance).toHaveBeenCalledWith(TOKEN, SPENDER, NONCE, expect.anything())
      expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: false })

      await act((result.current as AllowanceRequired).approveAndPermit)
      mockUsePendingApproval.mockReturnValue('0xd3adb33f')
      rerender()
      expect(addTransactionInfo).toHaveBeenCalledWith(info)
      expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: true })

      updateTokenAllowance.mockReset()
      await act((result.current as AllowanceRequired).approveAndPermit)
      expect(updateTokenAllowance).not.toHaveBeenCalled() // should not be called if already pending

      mockUsePendingApproval.mockReturnValue(undefined)
      mockUseTokenAllowance.mockReturnValue({ tokenAllowance: ZERO_ALLOWANCE, isSyncing: true })
      rerender()
      expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: true })

      await act((result.current as AllowanceRequired).approveAndPermit)
      expect(updateTokenAllowance).not.toHaveBeenCalled() // should not be called if already pending

      mockUseTokenAllowance.mockReturnValue({ tokenAllowance: AMOUNT })
      rerender()
      expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.ALLOWED })
    })

    describe('with approval', () => {
      it('signs permit allowance (does not rerequest approval)', async () => {
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: AMOUNT })

        mockUseUpdatePermitAllowance.mockImplementation((token, spender, nonce, onPermitSignature) => () => {
          onPermitSignature({
            signature: SIGNATURE,
            sigDeadline: DEADLINE,
            details: {
              token: TOKEN.address,
            },
            spender: SPENDER,
          })
        })

        const { result, rerender } = renderHook(() => usePermit2Allowance(AMOUNT, SPENDER))
        await act(() => hardhat.provider.getNetwork()) // activate hardhat connector
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: false })

        await act((result.current as AllowanceRequired).approveAndPermit)
        rerender()
        expect(result.current).toMatchObject({
          token: TOKEN,
          state: AllowanceState.ALLOWED,
          permitSignature: { signature: SIGNATURE },
        })
      })
    })

    describe('with permit', () => {
      it('tracks token allowance (does not rerequest signature)', async () => {
        mockUsePermitAllowance.mockReturnValue({ permitAllowance: AMOUNT, expiration: DEADLINE, nonce: NONCE })

        const info = { __brand: 'info' }
        const addTransactionInfo = jest.fn()
        mockUseUpdateTokenAllowance.mockReturnValue(() => Promise.resolve(info))
        mockUseAddTransactionInfo.mockReturnValue(addTransactionInfo)

        const { result, rerender } = renderHook(() => usePermit2Allowance(AMOUNT, SPENDER))
        await act(() => hardhat.provider.getNetwork()) // activate hardhat connector
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: false })

        await act((result.current as AllowanceRequired).approveAndPermit)
        mockUsePendingApproval.mockReturnValue('0xd3adb33f')
        rerender()
        expect(addTransactionInfo).toHaveBeenCalledWith(info)
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: true })

        mockUsePendingApproval.mockReturnValue(undefined)
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: AMOUNT })
        rerender()
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.ALLOWED })
      })

      it('rerequests an expired permit', async () => {
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: AMOUNT })
        mockUsePermitAllowance.mockReturnValue({
          permitAllowance: AMOUNT,
          expiration: Math.floor(Date.now() / 1000),
          nonce: NONCE,
        })

        const updatePermitAllowance = jest.fn()
        mockUseUpdatePermitAllowance.mockReturnValue(updatePermitAllowance)

        const { result } = renderHook(() => usePermit2Allowance(AMOUNT, SPENDER))
        await act(() => hardhat.provider.getNetwork()) // activate hardhat connector
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: false })

        await act((result.current as AllowanceRequired).approveAndPermit)
        expect(updatePermitAllowance).toHaveBeenCalled()
      })
    })

    describe('with signature', () => {
      it('tracks token allowance (does not rerequest signature)', async () => {
        mockUseUpdatePermitAllowance.mockImplementationOnce((token, spender, nonce, onPermitSignature) => {
          onPermitSignature({
            signature: SIGNATURE,
            sigDeadline: DEADLINE,
            details: {
              token: TOKEN.address,
            },
            spender: SPENDER,
          })
        })

        const info = { __brand: 'info' }
        const addTransactionInfo = jest.fn()
        mockUseUpdateTokenAllowance.mockReturnValue(() => Promise.resolve(info))
        mockUseAddTransactionInfo.mockReturnValue(addTransactionInfo)

        const { result, rerender } = renderHook(() => usePermit2Allowance(AMOUNT, SPENDER))
        await act(() => hardhat.provider.getNetwork()) // activate hardhat connector
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: false })

        await act((result.current as AllowanceRequired).approveAndPermit)
        mockUsePendingApproval.mockReturnValue('0xd3adb33f')
        rerender()
        expect(addTransactionInfo).toHaveBeenCalledWith(info)
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: true })

        mockUsePendingApproval.mockReturnValue(undefined)
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: AMOUNT })
        rerender()
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.ALLOWED })
      })

      it('rerequests an expired signature', async () => {
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: AMOUNT })
        mockUseUpdatePermitAllowance.mockImplementationOnce((token, spender, nonce, onPermitSignature) => {
          onPermitSignature({
            signature: SIGNATURE,
            sigDeadline: Math.floor(Date.now() / 1000),
            details: {
              token: TOKEN.address,
            },
            spender: SPENDER,
          })
        })

        const updatePermitAllowance = jest.fn()
        mockUseUpdatePermitAllowance.mockReturnValue(updatePermitAllowance)

        const { result } = renderHook(() => usePermit2Allowance(AMOUNT, SPENDER))
        await act(() => hardhat.provider.getNetwork()) // activate hardhat connector
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: false })

        await act((result.current as AllowanceRequired).approveAndPermit)
        expect(updatePermitAllowance).toHaveBeenCalled()
      })
    })
  })
})
