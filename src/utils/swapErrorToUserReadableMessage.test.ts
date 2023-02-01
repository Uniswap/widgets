import { swapErrorToUserReadableMessage } from './swapErrorToUserReadableMessage'

describe('swapErrorToUserReadableMessage', () => {
  test('should return "Transaction rejected" when error code is 4001', () => {
    const error = {
      code: 4001,
    }
    expect(swapErrorToUserReadableMessage(error)).toBe('Transaction rejected')
  })

  test('UniswapV2Router: EXPIRED', () => {
    const error = {
      reason: 'UniswapV2Router: EXPIRED',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'This transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.'
    )
  })

  test('UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT', () => {
    const error = {
      reason: 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
    )
  })

  test('UniswapV2Router: EXCESSIVE_INPUT_AMOUNT', () => {
    const error = {
      reason: 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
    )
  })

  test('TransferHelper: TRANSFER_FROM_FAILED', () => {
    const error = {
      reason: 'TransferHelper: TRANSFER_FROM_FAILED',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'The input token cannot be transferred. There may be an issue with the input token.'
    )
  })

  test('UniswapV2: TRANSFER_FAILED', () => {
    const error = {
      reason: 'UniswapV2: TRANSFER_FAILED',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'The output token cannot be transferred. There may be an issue with the output token.'
    )
  })

  test('UniswapV2: K', () => {
    const error = {
      reason: 'UniswapV2: K',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'The Uniswap invariant x*y=k was not satisfied by the swap. This usually means one of the tokens you are swapping incorporates custom behavior on transfer.'
    )
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'The Uniswap invariant x*y=k was not satisfied by the swap. This usually means one of the tokens you are swapping incorporates custom behavior on transfer.'
    )
  })

  test('Too little received', () => {
    const error = {
      reason: 'Too little received',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'This transaction will not succeed due to price movement. Try increasing your slippage tolerance. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.'
    )
  })

  test('Too much requested', () => {
    const error = {
      reason: 'Too much requested',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'This transaction will not succeed due to price movement. Try increasing your slippage tolerance. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.'
    )
  })

  test('STF', () => {
    const error = {
      reason: 'STF',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'This transaction will not succeed due to price movement. Try increasing your slippage tolerance. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.'
    )
  })

  test('TF', () => {
    const error = {
      reason: 'TF',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      'The output token cannot be transferred. There may be an issue with the output token. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.'
    )
  })

  test('Unknown error', () => {
    const error = {
      reason: '',
    }
    expect(swapErrorToUserReadableMessage(error)).toBe(
      `Unknown error. Try increasing your slippage tolerance.
Note: fee-on-transfer and rebase tokens are incompatible with Uniswap V3.`
    )
  })
})
