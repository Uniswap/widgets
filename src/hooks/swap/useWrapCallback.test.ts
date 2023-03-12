import { parseEther } from '@ethersproject/units'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { ExtendedEther } from 'constants/tokens'
import { Field, stateAtom, swapEventHandlersAtom } from 'state/swap'
import { TransactionType } from 'state/transactions'
import { renderHook, waitFor } from 'test'

import useWrapCallback from './useWrapCallback'

const ETH = ExtendedEther.onChain(SupportedChainId.MAINNET)
const WETH = ETH.wrapped
const AMOUNT = CurrencyAmount.fromRawAmount(ETH, parseEther('1').toString())
const WRAP_TRANSACTION_INFO = {
  response: expect.any(Object),
  type: TransactionType.WRAP,
  amount: AMOUNT,
}

describe('useWrapCallback', () => {
  it('sends wrap to wallet', async () => {
    const { result } = renderHook(() => useWrapCallback(), {
      initialAtomValues: [[stateAtom, { amount: '1', [Field.INPUT]: ETH, [Field.OUTPUT]: WETH }]],
    })
    expect(result.current.callback).toBeInstanceOf(Function)

    const info = await waitFor(async () => {
      const info = await result.current.callback()
      expect(info).toBeDefined()
      return info
    })
    expect(info).toEqual(WRAP_TRANSACTION_INFO)
  })

  it('triggers onWrapSend', async () => {
    const onWrapSend = jest.fn()
    const { result } = renderHook(() => useWrapCallback(), {
      initialAtomValues: [
        [stateAtom, { amount: '1', [Field.INPUT]: ETH, [Field.OUTPUT]: WETH }],
        [swapEventHandlersAtom, { onWrapSend }],
      ],
    })
    await waitFor(async () => {
      await expect(result.current.callback()).resolves.toBeDefined()
    })
    expect(onWrapSend).toHaveBeenLastCalledWith(expect.objectContaining({ amount: AMOUNT }), expect.any(Promise))
    await expect(onWrapSend.mock.calls.slice(-1)[0][1]).resolves.toEqual(WRAP_TRANSACTION_INFO)
  })
})
