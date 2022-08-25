import { Trans } from '@lingui/macro'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useSwapAmount, useSwapInfo } from 'hooks/swap'
import { useSwapApprovalOptimizedTrade } from 'hooks/swap/useSwapApproval'
import { useSwapCallback } from 'hooks/swap/useSwapCallback'
import useWrapCallback from 'hooks/swap/useWrapCallback'
import { useAddTransactionInfo } from 'hooks/transactions'
import { useSetOldestValidBlock } from 'hooks/useIsValidBlock'
import useNativeCurrency from 'hooks/useNativeCurrency'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { Spinner } from 'icons'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { TradeState } from 'state/routing/types'
import { displayTxHashAtom, feeOptionsAtom, Field, swapEventHandlersAtom } from 'state/swap'
import { TransactionInfo, TransactionType } from 'state/transactions'
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

  const addTransactionInfo = useAddTransactionInfo()
  const setDisplayTxHash = useUpdateAtom(displayTxHashAtom)
  const [, setInputAmount] = useSwapAmount(Field.INPUT)

  // Submits a transaction. Returns true if the transaction was submitted.
  const onSubmit = useCallback(
    async (submit: () => Promise<TransactionInfo | undefined>): Promise<boolean> => {
      let info: TransactionInfo | undefined
      try {
        info = await submit()
      } catch (e) {
        console.error('Failed to submit', e)
      }
      if (!info) return false

      addTransactionInfo(info)
      setDisplayTxHash(info.response.hash)

      if (isAnimating(document)) {
        // Only reset the input amount after any queued animations to avoid layout thrashing,
        // because a successful submit will open the status dialog and immediately cover input.
        return new Promise((resolve) => {
          const onAnimationEnd = () => {
            document.removeEventListener('animationend', onAnimationEnd)
            setInputAmount('')
          }
          document.addEventListener('animationend', onAnimationEnd)
        })
      } else {
        setInputAmount('')
      }

      return true
    },
    [addTransactionInfo, setDisplayTxHash, setInputAmount]
  )

  const [isPending, setIsPending] = useState(false)
  const native = useNativeCurrency()
  const onWrap = useCallback(async () => {
    setIsPending(true)
    await onSubmit(async () => {
      const response = await wrapCallback()
      if (!response) return

      invariant(wrapType !== undefined) // if response is valid, then so is wrapType
      const amount = CurrencyAmount.fromRawAmount(native, response.value?.toString() ?? '0')
      return { response, type: wrapType, amount }
    })

    // Whether or not the transaction submits, we should still reset the pending state.
    setIsPending(false)
  }, [native, onSubmit, wrapCallback, wrapType])
  // Reset the pending state if user updates the swap.
  useEffect(() => setIsPending(false), [inputCurrencyAmount, trade])

  const setOldestValidBlock = useSetOldestValidBlock()
  const onSwap = useCallback(async () => {
    const submitted = await onSubmit(async () => {
      const response = await swapCallback?.()
      if (!response) return

      // Set the block containing the response to the oldest valid block to ensure that the
      // completed trade's impact is reflected in future fetched trades.
      response.wait(1).then((receipt) => {
        setOldestValidBlock(receipt.blockNumber)
      })

      invariant(trade.trade)
      return { type: TransactionType.SWAP, response, tradeType: trade.trade.tradeType, trade: trade.trade }
    })

    // Only close the review modal if the transaction has submitted.
    if (submitted) {
      setOpen(false)
    }
  }, [onSubmit, setOldestValidBlock, swapCallback, trade.trade])

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
              const open = await Promise.resolve(onReviewSwapClick?.())?.catch(() => false)
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
