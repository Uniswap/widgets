import { TransactionResponse } from '@ethersproject/abstract-provider'
import { parseEther } from '@ethersproject/units'
import * as BlockNumber from 'hooks/useBlockNumber'
import useBlockNumber from 'hooks/useBlockNumber'
import { useMemo } from 'react'
import { act, renderComponent, waitFor } from 'test'

import Updater, { shouldCheck } from './updater'

describe('transactions updater', () => {
  describe('shouldCheck', () => {
    it('returns true if no receipt and never checked', () => {
      expect(shouldCheck(10, { addedTime: 100 })).toEqual(true)
    })
    it('returns false if has receipt and never checked', () => {
      expect(shouldCheck(10, { addedTime: 100, receipt: {} })).toEqual(false)
    })
    it('returns true if has not been checked in 1 blocks', () => {
      expect(shouldCheck(10, { addedTime: new Date().getTime(), lastCheckedBlockNumber: 9 })).toEqual(true)
    })
    it('returns false if checked in last 3 blocks and greater than 20 minutes old', () => {
      expect(shouldCheck(10, { addedTime: new Date().getTime() - 21 * 60 * 1000, lastCheckedBlockNumber: 8 })).toEqual(
        false
      )
    })
    it('returns true if not checked in last 5 blocks and greater than 20 minutes old', () => {
      expect(shouldCheck(10, { addedTime: new Date().getTime() - 21 * 60 * 1000, lastCheckedBlockNumber: 5 })).toEqual(
        true
      )
    })
    it('returns false if checked in last 10 blocks and greater than 60 minutes old', () => {
      expect(shouldCheck(20, { addedTime: new Date().getTime() - 61 * 60 * 1000, lastCheckedBlockNumber: 11 })).toEqual(
        false
      )
    })
    it('returns true if checked in last 3 blocks and greater than 20 minutes old', () => {
      expect(shouldCheck(20, { addedTime: new Date().getTime() - 61 * 60 * 1000, lastCheckedBlockNumber: 10 })).toEqual(
        true
      )
    })
  })

  it('fast forwards on a future receipt', async () => {
    const fastForwardBlockNumber = jest.fn()
    jest.spyOn(BlockNumber, 'useFastForwardBlockNumber').mockReturnValue(fastForwardBlockNumber)

    function BlockNumberTestComponent({ tx }: { tx?: TransactionResponse }) {
      const pendingTransactions = useMemo(
        () =>
          tx
            ? {
                [tx.hash]: {
                  addedTime: new Date().getTime(),
                  lastCheckedBlockNumber: 1,
                  info: tx,
                },
              }
            : {},
        [tx]
      )
      const nop = () => undefined
      return (
        <>
          <Updater pendingTransactions={pendingTransactions} onCheck={nop} onReceipt={nop} />
          {useBlockNumber()}
        </>
      )
    }

    const blockNumber = await act(() => hardhat.provider.getBlockNumber())
    const updater = renderComponent(<BlockNumberTestComponent />)

    await waitFor(() => expect(updater.container.textContent).toBe(blockNumber.toString()))

    const tx = await act(() =>
      hardhat.provider.getSigner().sendTransaction({
        to: hardhat.account.address,
        value: parseEther('1'),
      })
    )
    updater.rerender(<BlockNumberTestComponent tx={tx} />)
    await waitFor(() => expect(fastForwardBlockNumber).toHaveBeenCalledWith(tx.blockNumber))
  })
})
