import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { CurrencyAmount, MaxUint256 } from '@uniswap/sdk-core'
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { SupportedChainId } from 'constants/chains'
import { UNI } from 'constants/tokens'
import { useAddTransactionInfo, usePendingApproval } from 'hooks/transactions'
import { usePermitAllowance, useUpdatePermitAllowance } from 'hooks/usePermitAllowance'
import { useTokenAllowance, useUpdateTokenAllowance } from 'hooks/useTokenAllowance'
import ms from 'ms.macro'
import { act, renderHook, waitFor } from 'test'

import usePermit2Allowance, { AllowanceRequired, AllowanceState } from './usePermit2Allowance'

const SPENDER = UNIVERSAL_ROUTER_ADDRESS(SupportedChainId.MAINNET)

const TOKEN = UNI[SupportedChainId.MAINNET]
const MAX_AMOUNT = CurrencyAmount.fromRawAmount(TOKEN, MaxUint256.toString())
const ZERO_AMOUNT = CurrencyAmount.fromRawAmount(TOKEN, 0)

const SIGNATURE = 'signature'
const NONCE = 42
const DEADLINE = Math.floor((Date.now() + ms`1m`) / 1000)

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
      const { result } = renderHook(() => usePermit2Allowance(undefined, SPENDER))
      expect(result.current).toMatchObject({ state: AllowanceState.ALLOWED })
    })
  })

  it('returns AllowanceState.LOADING while awaiting allowances', async () => {
    const { result } = renderHook(() => usePermit2Allowance(MAX_AMOUNT, SPENDER))
    await waitFor(() => expect(useTokenAllowance).toHaveBeenCalledWith(TOKEN, addressMatcher, PERMIT2_ADDRESS))
    expect(usePermitAllowance).toHaveBeenCalledWith(TOKEN, addressMatcher, SPENDER)
    expect(result.current).toMatchObject({ state: AllowanceState.LOADING })
  })

  it('returns AllowanceState.ALLOWED with initial allowances', async () => {
    mockUseTokenAllowance.mockReturnValue({ tokenAllowance: MAX_AMOUNT })
    mockUsePermitAllowance.mockReturnValue({ permitAllowance: MAX_AMOUNT, expiration: DEADLINE, nonce: NONCE })
    const { result } = renderHook(() => usePermit2Allowance(MAX_AMOUNT, SPENDER))
    expect(result.current).toMatchObject({ state: AllowanceState.ALLOWED })
  })

  describe('approval flows', () => {
    beforeEach(() => {
      mockUseTokenAllowance.mockReturnValue({ tokenAllowance: ZERO_AMOUNT })
      mockUsePermitAllowance.mockReturnValue({ permitAllowance: ZERO_AMOUNT, nonce: NONCE })
    })

    function itReturnsAllowanceStateRequired() {
      it('returns AllowanceState.REQUIRED', async () => {
        const { result } = renderHook(() => usePermit2Allowance(MAX_AMOUNT, SPENDER))
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: false })
        await waitFor(() => expect(useUpdateTokenAllowance).toHaveBeenCalledWith(MAX_AMOUNT, PERMIT2_ADDRESS))
        expect(useUpdatePermitAllowance).toHaveBeenCalledWith(TOKEN, SPENDER, NONCE, expect.anything())
      })
    }

    describe('with no initial allowances', () => {
      itReturnsAllowanceStateRequired()

      it('tracks token allowance', async () => {
        const info = { __brand: 'info' }
        const updateTokenAllowance = jest.fn().mockResolvedValue(info)
        mockUseUpdateTokenAllowance.mockReturnValue(updateTokenAllowance)
        const addTransactionInfo = jest.fn().mockImplementation(() => {
          mockUsePendingApproval.mockReturnValue('0xd3adb33f')
        })
        mockUseAddTransactionInfo.mockReturnValue(addTransactionInfo)

        const updatePermitAllowance = jest.fn()
        mockUseUpdatePermitAllowance.mockImplementation((token, spender, nonce, onPermitSignature) =>
          updatePermitAllowance.mockImplementation(() => {
            onPermitSignature({
              signature: SIGNATURE,
              sigDeadline: DEADLINE,
              details: {
                token: TOKEN.address,
              },
              spender: SPENDER,
            })
          })
        )

        const { result, rerender } = renderHook(() => usePermit2Allowance(MAX_AMOUNT, SPENDER))
        await act((result.current as AllowanceRequired).approveAndPermit)
        rerender()
        expect(addTransactionInfo).toHaveBeenCalledWith(info)
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: true })

        // Mock the transaction confirming with the token allowance not yet updated to reflect it.
        mockUsePendingApproval.mockReturnValue(undefined)
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: ZERO_AMOUNT, isSyncing: true })
        rerender()
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: true })

        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: MAX_AMOUNT })
        rerender()
        expect(result.current).toMatchObject({ state: AllowanceState.ALLOWED })
      })

      it('tracks token allowance even if signature is declined', async () => {
        const info = { __brand: 'info' }
        const updateTokenAllowance = jest.fn().mockResolvedValue(info)
        mockUseUpdateTokenAllowance.mockReturnValue(updateTokenAllowance)
        const addTransactionInfo = jest.fn().mockImplementation(() => {
          mockUsePendingApproval.mockReturnValue('0xd3adb33f')
        })
        mockUseAddTransactionInfo.mockReturnValue(addTransactionInfo)

        const error = new Error('signature declined')
        const updatePermitAllowance = jest.fn().mockRejectedValue(error)
        mockUseUpdatePermitAllowance.mockImplementation(() => updatePermitAllowance)

        const { result, rerender } = renderHook(() => usePermit2Allowance(MAX_AMOUNT, SPENDER))
        await expect(async () => {
          await act((result.current as AllowanceRequired).approveAndPermit)
        }).rejects.toThrow(error)
        rerender()
        expect(addTransactionInfo).toHaveBeenCalledWith(info)
        expect(result.current).toMatchObject({
          token: TOKEN,
          state: AllowanceState.REQUIRED,
          isApprovalLoading: false, // must still be false while there is no permit allowance
        })

        mockUsePermitAllowance.mockReturnValue({ permitAllowance: MAX_AMOUNT, expiration: DEADLINE, nonce: NONCE })
        rerender()
        expect(result.current).toMatchObject({
          token: TOKEN,
          state: AllowanceState.REQUIRED,
          isApprovalLoading: true, // true now that permit has allowance
        })
      })
    })

    describe('with initial token allowance', () => {
      beforeEach(() => {
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: MAX_AMOUNT })
      })

      itReturnsAllowanceStateRequired()

      it('signs permit allowance without re-requesting token allowance', async () => {
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

        const { result, rerender } = renderHook(() => usePermit2Allowance(MAX_AMOUNT, SPENDER))
        await act((result.current as AllowanceRequired).approveAndPermit)
        rerender()
        expect(result.current).toMatchObject({
          state: AllowanceState.ALLOWED,
          permitSignature: { signature: SIGNATURE },
        })
      })
    })

    function itTracksTokenAllowance() {
      it('tracks token allowance without re-requesting permit allowance', async () => {
        const info = { __brand: 'info' }
        const updateTokenAllowance = jest.fn().mockResolvedValue(info)
        mockUseUpdateTokenAllowance.mockReturnValue(updateTokenAllowance)
        const addTransactionInfo = jest.fn().mockImplementation(() => {
          mockUsePendingApproval.mockReturnValue('0xd3adb33f')
        })
        mockUseAddTransactionInfo.mockReturnValue(addTransactionInfo)

        const updatePermitAllowance = jest.fn()
        mockUseUpdatePermitAllowance.mockImplementation(() => updatePermitAllowance)

        const { result, rerender } = renderHook(() => usePermit2Allowance(MAX_AMOUNT, SPENDER))
        await act((result.current as AllowanceRequired).approveAndPermit)
        rerender()
        expect(addTransactionInfo).toHaveBeenCalledWith(info)
        expect(updatePermitAllowance).not.toHaveBeenCalled()
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: true })

        // Mock the transaction confirming with the token allowance not yet updated to reflect it.
        mockUsePendingApproval.mockReturnValue(undefined)
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: ZERO_AMOUNT, isSyncing: true })
        rerender()
        expect(result.current).toMatchObject({ token: TOKEN, state: AllowanceState.REQUIRED, isApprovalLoading: true })

        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: MAX_AMOUNT })
        rerender()
        expect(result.current).toMatchObject({ state: AllowanceState.ALLOWED })
      })
    }

    function itDoesNotResubmitAPendingApproval() {
      it('does not resubmit a pending approval', async () => {
        mockUsePendingApproval.mockReturnValue('0xd3adb33f')
        const updateTokenAllowance = jest.fn()
        mockUseUpdateTokenAllowance.mockReturnValue(updateTokenAllowance)
        mockUsePermitAllowance.mockReturnValue({ permitAllowance: MAX_AMOUNT, expiration: DEADLINE, nonce: NONCE })

        const { result, rerender } = renderHook(() => usePermit2Allowance(MAX_AMOUNT, SPENDER))
        await act((result.current as AllowanceRequired).approveAndPermit)
        expect(updateTokenAllowance).not.toHaveBeenCalled()

        mockUsePendingApproval.mockReturnValue(undefined)
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: ZERO_AMOUNT, isSyncing: true })
        rerender()
        await act((result.current as AllowanceRequired).approveAndPermit)
        expect(updateTokenAllowance).not.toHaveBeenCalled()
      })
    }

    describe('with initial permit allowance', () => {
      beforeEach(() => {
        mockUsePermitAllowance.mockReturnValue({ permitAllowance: MAX_AMOUNT, expiration: DEADLINE, nonce: NONCE })
      })

      itReturnsAllowanceStateRequired()
      itTracksTokenAllowance()
      itDoesNotResubmitAPendingApproval()

      it('rerequests an expired permit', async () => {
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: MAX_AMOUNT })
        mockUsePermitAllowance.mockReturnValue({
          permitAllowance: MAX_AMOUNT,
          expiration: Math.floor(Date.now() / 1000),
          nonce: NONCE,
        })

        const updatePermitAllowance = jest.fn()
        mockUseUpdatePermitAllowance.mockReturnValue(updatePermitAllowance)

        const { result } = renderHook(() => usePermit2Allowance(MAX_AMOUNT, SPENDER))
        await waitFor(() =>
          expect(result.current).toMatchObject({
            token: TOKEN,
            state: AllowanceState.REQUIRED,
            isApprovalLoading: false,
          })
        )

        await act((result.current as AllowanceRequired).approveAndPermit)
        expect(updatePermitAllowance).toHaveBeenCalled()
      })
    })

    describe('with initial signature', () => {
      beforeEach(() => {
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
      })

      itReturnsAllowanceStateRequired()
      itTracksTokenAllowance()
      itDoesNotResubmitAPendingApproval()

      it('rerequests an expired signature', async () => {
        mockUseTokenAllowance.mockReturnValue({ tokenAllowance: MAX_AMOUNT })
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

        const { result } = renderHook(() => usePermit2Allowance(MAX_AMOUNT, SPENDER))
        await waitFor(() =>
          expect(result.current).toMatchObject({
            token: TOKEN,
            state: AllowanceState.REQUIRED,
            isApprovalLoading: false,
          })
        )

        await act((result.current as AllowanceRequired).approveAndPermit)
        expect(updatePermitAllowance).toHaveBeenCalled()
      })
    })
  })
})
