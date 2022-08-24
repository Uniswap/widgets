import { Trans } from '@lingui/macro'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useSwapInfo } from 'hooks/swap'
import { useSwapApprovalOptimizedTrade } from 'hooks/swap/useSwapApproval'
import { useSwapCallback } from 'hooks/swap/useSwapCallback'
import useWrapCallback from 'hooks/swap/useWrapCallback'
import { useAddTransaction } from 'hooks/transactions'
import { useSetOldestValidBlock } from 'hooks/useIsValidBlock'
import useNativeCurrency from 'hooks/useNativeCurrency'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { Spinner } from 'icons'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { TradeState } from 'state/routing/types'
import { displayTxHashAtom, feeOptionsAtom, Field, swapEventHandlersAtom } from 'state/swap'
import { TransactionType } from 'state/transactions'
import { useTheme } from 'styled-components/macro'
import invariant from 'tiny-invariant'
import { isAnimating } from 'utils/animations'

import ActionButton, { ActionButtonProps } from '../../ActionButton'
import Dialog from '../../Dialog'
import { SummaryDialog } from '../Summary'
import useApprovalData, { useIsPendingApproval } from './useApprovalData'

interface SwapButtonProps {
  disabled?: boolean
}

export default memo(function SwapButton({ disabled }: SwapButtonProps) {
  const { account, chainId } = useWeb3React()
  const {
    [Field.INPUT]: {
      currency: inputCurrency,
      amount: inputCurrencyAmount,
      balance: inputCurrencyBalance,
      usdc: inputUSDC,
    },
    [Field.OUTPUT]: { usdc: outputUSDC },
    trade,
    slippage,
    impact,
  } = useSwapInfo()
  const feeOptions = useAtomValue(feeOptionsAtom)

  // TODO(zzmp): Return an optimized trade directly from useSwapInfo.
  const optimizedTrade =
    // Use trade.trade if there is no swap optimized trade. This occurs if approvals are still pending.
    useSwapApprovalOptimizedTrade(trade.trade, slippage.allowed, useIsPendingApproval) || trade.trade
  const deadline = useTransactionDeadline()

  const { type: wrapType, callback: wrapCallback, isWrap } = useWrapCallback()
  const { approvalAction, signatureData } = useApprovalData(optimizedTrade, slippage, inputCurrencyAmount)
  const { callback: swapCallback } = useSwapCallback({
    trade: optimizedTrade,
    allowedSlippage: slippage.allowed,
    recipientAddressOrName: account ?? null,
    signatureData,
    deadline,
    feeOptions,
  })

  const [open, setOpen] = useState(false)
  // Close the review modal if there is no available trade.
  useEffect(() => setOpen((open) => (trade.trade ? open : false)), [trade.trade])
  // Close the review modal on chain change.
  useEffect(() => setOpen(false), [chainId])

  const addTransaction = useAddTransaction()
  const setDisplayTxHash = useUpdateAtom(displayTxHashAtom)
  const setOldestValidBlock = useSetOldestValidBlock()

  const [isPending, setIsPending] = useState(false)
  const native = useNativeCurrency()
  const onWrap = useCallback(async () => {
    setIsPending(true)
    try {
      const transaction = await wrapCallback()
      if (!transaction) return
      invariant(wrapType !== undefined)
      addTransaction({
        response: transaction,
        type: wrapType,
        amount: CurrencyAmount.fromRawAmount(native, transaction.value?.toString() ?? '0'),
      })
      setDisplayTxHash(transaction.hash)
      // Only reset pending after any queued animations to avoid layout thrashing, because a
      // successful wrap will open the status dialog and immediately cover the button.
      const postWrap = () => {
        setIsPending(false)
        document.removeEventListener('animationend', postWrap)
      }
      if (isAnimating(document)) {
        document.addEventListener('animationend', postWrap)
      } else {
        setIsPending(false)
      }
    } catch (e) {
      // TODO(zzmp): Surface errors from wrap.
      console.log(e)
    } finally {
      setIsPending(false)
    }
  }, [addTransaction, native, setDisplayTxHash, wrapCallback, wrapType])
  // Reset the pending state if user updates the swap.
  useEffect(() => setIsPending(false), [inputCurrencyAmount, trade])

  const onSwap = useCallback(async () => {
    try {
      const transaction = await swapCallback?.()
      if (!transaction) return
      invariant(trade.trade)
      addTransaction({
        type: TransactionType.SWAP,
        response: transaction,
        tradeType: trade.trade.tradeType,
        trade: trade.trade,
      })
      setDisplayTxHash(transaction.hash)

      // Set the block containing the response to the oldest valid block to ensure that the
      // completed trade's impact is reflected in future fetched trades.
      transaction.wait(1).then((receipt) => {
        setOldestValidBlock(receipt.blockNumber)
      })

      // Only reset open after any queued animations to avoid layout thrashing, because a
      // successful swap will open the status dialog and immediately cover the summary dialog.
      const postSwap = () => {
        setOpen(false)
        document.removeEventListener('animationend', postSwap)
      }
      if (isAnimating(document)) {
        document.addEventListener('animationend', postSwap)
      } else {
        setOpen(false)
      }
    } catch (e) {
      // TODO(zzmp): Surface errors from swap.
      console.log(e)
    }
  }, [addTransaction, setDisplayTxHash, setOldestValidBlock, swapCallback, trade.trade])

  const disableSwap = useMemo(
    () =>
      disabled ||
      !chainId ||
      (!isWrap && !optimizedTrade) ||
      !(inputCurrencyAmount && inputCurrencyBalance) ||
      inputCurrencyBalance.lessThan(inputCurrencyAmount),
    [disabled, isWrap, chainId, optimizedTrade, inputCurrencyAmount, inputCurrencyBalance]
  )
  const { onReviewSwapClick } = useAtomValue(swapEventHandlersAtom)
  const actionProps = useMemo((): Partial<ActionButtonProps> | undefined => {
    if (disableSwap) {
      return { disabled: true }
    } else if (isWrap) {
      return isPending
        ? { action: { message: <Trans>Confirm in your wallet</Trans>, icon: Spinner } }
        : { onClick: onWrap }
    } else {
      return approvalAction
        ? { action: approvalAction }
        : trade.state === TradeState.VALID
        ? {
            onClick: async () => {
              const open = await onReviewSwapClick?.()?.catch(() => false)
              setOpen(open ?? true)
            },
          }
        : { disabled: true }
    }
  }, [disableSwap, isWrap, isPending, onWrap, approvalAction, trade.state, onReviewSwapClick])
  const Label = useCallback(() => {
    switch (wrapType) {
      case TransactionType.WRAP:
        return <Trans>Wrap {inputCurrency?.symbol}</Trans>
      case TransactionType.UNWRAP:
        return <Trans>Unwrap {inputCurrency?.symbol}</Trans>
      case undefined:
        return <Trans>Review swap</Trans>
    }
  }, [inputCurrency?.symbol, wrapType])
  const onClose = useCallback(() => setOpen(false), [])

  const { tokenColorExtraction } = useTheme()
  return (
    <>
      <ActionButton color={tokenColorExtraction ? 'interactive' : 'accent'} {...actionProps}>
        <Label />
      </ActionButton>
      {open && trade.trade && (
        <Dialog color="dialog" onClose={onClose}>
          <SummaryDialog
            trade={trade.trade}
            slippage={slippage}
            inputUSDC={inputUSDC}
            outputUSDC={outputUSDC}
            impact={impact}
            onConfirm={onSwap}
          />
        </Dialog>
      )}
    </>
  )
})
