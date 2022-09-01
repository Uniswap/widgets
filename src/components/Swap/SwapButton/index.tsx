import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useSwapInfo } from 'hooks/swap'
import { ApproveOrPermitState, useApproveOrPermit, useSwapApprovalOptimizedTrade } from 'hooks/swap/useSwapApproval'
import { useSwapCallback } from 'hooks/swap/useSwapCallback'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { useSetOldestValidBlock } from 'hooks/useIsValidBlock'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useAtomValue } from 'jotai/utils'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { TradeState } from 'state/routing/types'
import { feeOptionsAtom, Field, swapEventHandlersAtom } from 'state/swap'
import { TransactionType } from 'state/transactions'
import { useTheme } from 'styled-components/macro'
import invariant from 'tiny-invariant'

import ActionButton, { ActionButtonProps } from '../../ActionButton'
import Dialog from '../../Dialog'
import { SummaryDialog } from '../Summary'
import ApproveButton, { useIsPendingApproval } from './ApproveButton'
import useOnSubmit from './useOnSubmit'
import WrapButton from './WrapButton'

interface SwapButtonProps {
  disabled?: boolean
}

export default memo(function SwapButton({ disabled }: SwapButtonProps) {
  const { account, chainId } = useWeb3React()
  const {
    [Field.INPUT]: { amount: inputCurrencyAmount, balance: inputCurrencyBalance, usdc: inputUSDC },
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

  const approval = useApproveOrPermit(optimizedTrade, slippage.allowed, useIsPendingApproval, inputCurrencyAmount)
  const { callback: swapCallback } = useSwapCallback({
    trade: optimizedTrade,
    allowedSlippage: slippage.allowed,
    recipientAddressOrName: account ?? null,
    signatureData: approval.signatureData,
    deadline,
    feeOptions,
  })

  const [open, setOpen] = useState(false)
  // Close the review modal if there is no available trade.
  useEffect(() => setOpen((open) => (trade.trade ? open : false)), [trade.trade])
  // Close the review modal on chain change.
  useEffect(() => setOpen(false), [chainId])

  const onSubmit = useOnSubmit()
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
      return {
        type: TransactionType.SWAP,
        response,
        tradeType: trade.trade.tradeType,
        trade: trade.trade,
        slippageTolerance: slippage.allowed,
      }
    })

    // Only close the review modal if the transaction has submitted.
    if (submitted) {
      setOpen(false)
    }
  }, [onSubmit, setOldestValidBlock, slippage.allowed, swapCallback, trade.trade])

  const isWrap = useIsWrap()
  const isDisabled = useMemo(
    () =>
      !chainId ||
      (!isWrap && !optimizedTrade) ||
      !(inputCurrencyAmount && inputCurrencyBalance) ||
      inputCurrencyBalance.lessThan(inputCurrencyAmount),
    [isWrap, chainId, optimizedTrade, inputCurrencyAmount, inputCurrencyBalance]
  )
  const onReviewSwapClick = useConditionalHandler(useAtomValue(swapEventHandlersAtom).onReviewSwapClick)
  const actionProps = useMemo((): Partial<ActionButtonProps> | undefined => {
    return trade.state === TradeState.VALID
      ? {
          onClick: async () => {
            setOpen(await onReviewSwapClick())
          },
        }
      : { disabled: true }
  }, [trade.state, onReviewSwapClick])

  const { tokenColorExtraction } = useTheme()

  if (disabled || isDisabled) {
    return (
      <ActionButton color={tokenColorExtraction ? 'interactive' : 'accent'} disabled={true}>
        <Trans>Review swap</Trans>
      </ActionButton>
    )
  }

  if (isWrap) return <WrapButton onSubmit={onSubmit} />
  if (approval.approvalState !== ApproveOrPermitState.APPROVED) {
    return <ApproveButton onSubmit={onSubmit} trade={trade.trade} {...approval} />
  }

  return (
    <>
      <ActionButton color={tokenColorExtraction ? 'interactive' : 'accent'} {...actionProps}>
        <Trans>Review swap</Trans>
      </ActionButton>
      {open && trade.trade && (
        <Dialog color="dialog" onClose={() => setOpen(false)}>
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
