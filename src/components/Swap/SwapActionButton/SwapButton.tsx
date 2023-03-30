import { Trans } from '@lingui/macro'
import { useIsAmountPopulated, useSwapInfo } from 'hooks/swap'
import { useSwapCallback } from 'hooks/swap/useSwapCallback'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { useSetOldestValidBlock } from 'hooks/useIsValidBlock'
import { usePermit2 as usePermit2Enabled } from 'hooks/useSyncFlags'
import { useEvmChainId } from 'hooks/useSyncWidgetSettings'
import useTokenColorExtraction from 'hooks/useTokenColorExtraction'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useEffect, useState } from 'react'
import { feeOptionsAtom, Field, swapEventHandlersAtom } from 'state/swap'
import { TransactionType } from 'state/transactions'
import invariant from 'tiny-invariant'

import ActionButton from '../../ActionButton'
import Dialog from '../../Dialog'
import { SummaryDialog } from '../Summary'
import { useCollapseToolbar } from '../Toolbar'
import useOnSubmit from './useOnSubmit'
/**
 * A swapping ActionButton.
 * Should only be rendered if a valid swap exists.
 */
export default function SwapButton({ disabled }: { disabled: boolean }) {
  const evmChainId = useEvmChainId()

  const {
    [Field.INPUT]: { currency: inputCurrency, usdc: inputUSDC },
    [Field.OUTPUT]: { currency: outputCurrency, usdc: outputUSDC },
    trade: { trade, gasUseEstimateUSD },
    // approval,
    slippage,
    impact,
  } = useSwapInfo()
  const deadline = useTransactionDeadline()
  const feeOptions = useAtomValue(feeOptionsAtom)
  const color = useTokenColorExtraction()
  const isAmountPopulated = useIsAmountPopulated()
  const missingInput = inputCurrency != null && outputCurrency != null && !isAmountPopulated

  const permit2Enabled = usePermit2Enabled()
  const { callback: swapCallback } = useSwapCallback({
    trade: permit2Enabled ? undefined : trade,
    allowedSlippage: slippage.allowed,
    recipientAddressOrName: null,
    // signatureData: approval?.signatureData,
    deadline,
    feeOptions,
  })

  const [open, setOpen] = useState(false)
  // Close the review modal if there is no available trade.
  useEffect(() => setOpen((open) => (trade ? open : false)), [trade])
  // Close the review modal on chain change.
  useEffect(() => setOpen(false), [evmChainId])
  const setOldestValidBlock = useSetOldestValidBlock()
  const onSubmit = useOnSubmit()
  const onSwap = useCallback(async () => {
    try {
      await onSubmit(async () => {
        const response: any = await swapCallback?.()
        if (!response) return

        // Set the block containing the response to the oldest valid block to ensure that the
        // completed trade's impact is reflected in future fetched trades.
        response.wait(1).then((receipt: any) => {
          setOldestValidBlock(receipt.blockNumber)
        })

        invariant(trade)
        return {
          type: TransactionType.SWAP,
          response,
          tradeType: trade.tradeType,
          trade,
          slippageTolerance: slippage.allowed,
        }
      })

      // Only close the review modal if the swap submitted (ie no-throw).
      setOpen(false)
    } catch (e) {
      console.error(e) // ignore error
    }
  }, [onSubmit, setOldestValidBlock, slippage.allowed, swapCallback, trade])

  const onReviewSwapClick = useConditionalHandler(useAtomValue(swapEventHandlersAtom).onReviewSwapClick)
  const collapseToolbar = useCollapseToolbar()
  const onClick = useCallback(async () => {
    collapseToolbar()
    setOpen(await onReviewSwapClick())
  }, [onReviewSwapClick, collapseToolbar])
  return (
    <>
      <ActionButton color={color} onClick={onClick} disabled={disabled}>
        <Trans>{missingInput ? 'Enter an amount' : 'Review'}</Trans>
      </ActionButton>
      {open && trade && (
        <Dialog color="container" onClose={() => setOpen(false)}>
          <SummaryDialog
            trade={trade}
            slippage={slippage}
            gasUseEstimateUSD={gasUseEstimateUSD}
            inputUSDC={inputUSDC}
            outputUSDC={outputUSDC}
            impact={impact}
            onConfirm={onSwap}
          />
        </Dialog>
      )}
    </>
  )
}
