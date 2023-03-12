import { Contract } from '@ethersproject/contracts'
import { MaxAllowanceTransferAmount, PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import PERMIT2_ABI from 'abis/permit2.json'
import { Permit2 } from 'abis/types'
import { SupportedChainId } from 'constants/chains'
import { UNI } from 'constants/tokens'
import { useSingleCallResult } from 'hooks/multicall'
import { useContract } from 'hooks/useContract'
import ms from 'ms.macro'
import { swapEventHandlersAtom } from 'state/swap'
import { renderHook, waitFor } from 'test'

import { usePermitAllowance, useUpdatePermitAllowance } from './usePermitAllowance'

const TOKEN = UNI[SupportedChainId.MAINNET]
const OWNER = hardhat.account.address
const SPENDER = UNIVERSAL_ROUTER_ADDRESS(SupportedChainId.MAINNET)

const CONTRACT = new Contract(PERMIT2_ADDRESS, PERMIT2_ABI) as Permit2
const EXPIRATION = 1234567890
const NONCE = 42

jest.mock('hooks/multicall')
jest.mock('hooks/useContract')
const mockUseContract = useContract as jest.Mock
const mockUseSingleCallResult = useSingleCallResult as jest.Mock

describe('usePermitAllowance', () => {
  const FETCH_DEFAULT_FREQ = { blocksPerFetch: undefined }
  const FETCH_EVERY_BLOCK = { blocksPerFetch: 1 }

  beforeEach(() => mockUseContract.mockReturnValue(CONTRACT))

  describe('with allowance not loaded', () => {
    beforeEach(() => mockUseSingleCallResult.mockReturnValue({}))

    it('fetches allowance', () => {
      const { result } = renderHook(() => usePermitAllowance(TOKEN, OWNER, SPENDER))
      expect(useContract).toHaveBeenCalledWith(PERMIT2_ADDRESS, expect.anything())
      expect(useSingleCallResult).toHaveBeenCalledWith(
        CONTRACT,
        'allowance',
        [OWNER, TOKEN.address, SPENDER],
        FETCH_DEFAULT_FREQ
      )
      expect(result.current).toMatchObject({ permitAllowance: undefined })
    })
  })

  describe('with no allowance', () => {
    beforeEach(() =>
      mockUseSingleCallResult.mockReturnValue({ result: { amount: BigInt(0), expiration: EXPIRATION, nonce: NONCE } })
    )

    it('refetches allowance every block - this ensures an allowance is "seen" on the block that it is granted', () => {
      const { result } = renderHook(() => usePermitAllowance(TOKEN, OWNER, SPENDER))
      expect(useContract).toHaveBeenCalledWith(PERMIT2_ADDRESS, expect.anything())
      expect(useSingleCallResult).toHaveBeenCalledWith(
        CONTRACT,
        'allowance',
        [OWNER, TOKEN.address, SPENDER],
        FETCH_EVERY_BLOCK
      )
      expect(result.current).toMatchObject({
        permitAllowance: CurrencyAmount.fromRawAmount(TOKEN, 0),
        expiration: EXPIRATION,
        nonce: NONCE,
      })
    })
  })

  describe('with allowance', () => {
    beforeEach(() =>
      mockUseSingleCallResult.mockReturnValue({
        result: { amount: MaxAllowanceTransferAmount.toString(), expiration: EXPIRATION, nonce: NONCE },
      })
    )

    it('fetches allowance', () => {
      const { result } = renderHook(() => usePermitAllowance(TOKEN, OWNER, SPENDER))
      expect(useSingleCallResult).toHaveBeenCalledWith(
        CONTRACT,
        'allowance',
        [OWNER, TOKEN.address, SPENDER],
        FETCH_DEFAULT_FREQ
      )
      expect(result.current).toMatchObject({
        permitAllowance: CurrencyAmount.fromRawAmount(TOKEN, MaxAllowanceTransferAmount.toString()),
        expiration: EXPIRATION,
        nonce: NONCE,
      })
    })
  })
})

describe('useUpdatePermitAllowance', () => {
  it('sends signature request to wallet', async () => {
    const onPermitSignature = jest.fn()
    const { result } = renderHook(() => useUpdatePermitAllowance(TOKEN, SPENDER, NONCE, onPermitSignature))
    expect(result.current).toBeInstanceOf(Function)

    const expectedSignature =
      '0x1befd08fcc4085dc484346d69fd15659616522454a33e66e7b0f6917379ab888236304ebed307813208bf004da04d998dcd15a8f83241d033e4040adc4b0b5311b'

    jest.spyOn(Date, 'now').mockReturnValue(0)
    await waitFor(() => result.current())
    expect(onPermitSignature).toHaveBeenCalledWith({
      details: {
        token: TOKEN.address,
        amount: MaxAllowanceTransferAmount,
        expiration: ms`30d` / 1000,
        nonce: NONCE,
      },
      sigDeadline: ms`30m` / 1000,
      signature:
        // Signature copied from a signature by the hardhat provider:
        expectedSignature,
      spender: SPENDER,
    })
  })

  it('triggers onPermit2Allowance', async () => {
    const onPermit2Allowance = jest.fn()
    const onPermitSignature = jest.fn()
    const { result } = renderHook(() => useUpdatePermitAllowance(TOKEN, SPENDER, NONCE, onPermitSignature), {
      initialAtomValues: [[swapEventHandlersAtom, { onPermit2Allowance }]],
    })
    await waitFor(() => result.current())
    expect(onPermit2Allowance).toHaveBeenLastCalledWith(
      expect.objectContaining({ token: TOKEN, spender: SPENDER }),
      expect.any(Promise)
    )
    await expect(onPermit2Allowance.mock.calls.slice(-1)[0][1]).resolves.toBe(undefined)
  })

  it('rejects on failure', async () => {
    const onPermitSignature = jest.fn()
    const { result } = renderHook(() => useUpdatePermitAllowance(TOKEN, SPENDER, NONCE, onPermitSignature))
    expect(result.current).toBeInstanceOf(Function)

    // Without waiting for hardhat to activate, there will be no chainId; we use this to trigger an error:
    await expect(() => result.current()).rejects.toThrow(`${TOKEN.symbol} permit allowance failed: missing chainId`)
    expect(onPermitSignature).not.toHaveBeenCalled()
  })
})
