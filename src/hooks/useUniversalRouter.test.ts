import { TransactionResponse } from '@ethersproject/abstract-provider'
import { sendTransaction } from '@uniswap/conedison/provider/index'
import { TradeType } from '@uniswap/sdk-core'
import { SwapRouter, UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { SupportedChainId } from 'constants/chains'
import { TWO_PERCENT } from 'constants/misc'
import { InterfaceTrade } from 'state/routing/types'
import { swapEventHandlersAtom } from 'state/swap'
import { TransactionType } from 'state/transactions'
import { renderHook, waitFor } from 'test'

import { useUniversalRouterSwapCallback } from './useUniversalRouter'

const TRADE = { tradeType: TradeType.EXACT_INPUT } as InterfaceTrade
const OPTIONS = { slippageTolerance: TWO_PERCENT }
const RESPONSE = { data: 'calldata' } as TransactionResponse
const SWAP_TRANSACTION_INFO = {
  type: TransactionType.SWAP,
  response: RESPONSE,
  tradeType: TRADE.tradeType,
  trade: TRADE,
  slippageTolerance: OPTIONS.slippageTolerance,
}

jest.mock('@uniswap/conedison/provider/index', () => ({
  sendTransaction: jest.fn().mockResolvedValue(RESPONSE),
}))

describe('useUniversalRouter', () => {
  jest.spyOn(SwapRouter, 'swapERC20CallParameters').mockReturnValue({ calldata: 'calldata', value: '0' })

  it('sends swap to wallet', async () => {
    const { result } = renderHook(() => useUniversalRouterSwapCallback(TRADE, OPTIONS))
    expect(result.current).toBeInstanceOf(Function)

    const info = await waitFor(() => result.current())
    expect(info).toEqual(SWAP_TRANSACTION_INFO)
    expect(sendTransaction).toHaveBeenCalledWith(
      hardhat.provider,
      {
        from: expect.stringMatching(new RegExp(hardhat.account.address, 'i')),
        to: UNIVERSAL_ROUTER_ADDRESS(SupportedChainId.MAINNET),
        data: 'calldata',
      },
      0.2
    )
  })

  it('triggers onSwapSend', async () => {
    const onSwapSend = jest.fn()
    const { result } = renderHook(() => useUniversalRouterSwapCallback(TRADE, OPTIONS), {
      initialAtomValues: [[swapEventHandlersAtom, { onSwapSend }]],
    })
    await waitFor(() => result.current())
    expect(onSwapSend).toHaveBeenLastCalledWith(expect.objectContaining({ trade: TRADE }), expect.any(Promise))
    await expect(onSwapSend.mock.calls.slice(-1)[0][1]).resolves.toEqual(SWAP_TRANSACTION_INFO)
  })
})
