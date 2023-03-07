import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { BottomSheetModal } from 'components/BottomSheetModal'
import { useAsyncError } from 'components/Error/ErrorBoundary'
import { useSwapInfo } from 'hooks/swap'
import { useSwapCallback } from 'hooks/swap/useSwapCallback'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { useIsMobileWidth } from 'hooks/useIsMobileWidth'
import { useSetOldestValidBlock } from 'hooks/useIsValidBlock'
import { AllowanceState } from 'hooks/usePermit2Allowance'
import { usePermit2 as usePermit2Enabled } from 'hooks/useSyncFlags'
import useTokenColorExtraction from 'hooks/useTokenColorExtraction'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useUniversalRouterSwapCallback } from 'hooks/useUniversalRouter'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useEffect, useState } from 'react'
import { feeOptionsAtom, Field, swapEventHandlersAtom } from 'state/swap'
import { TransactionType } from 'state/transactions'
import invariant from 'tiny-invariant'

import ActionButton from '../../ActionButton'
import Dialog, { useIsDialogPageCentered } from '../../Dialog'
import { SummaryDialog } from '../Summary'
import { useCollapseToolbar } from '../Toolbar/ToolbarContext'
import useOnSubmit from './useOnSubmit'

/**
 * A swapping ActionButton.
 * Should only be rendered if a valid swap exists.
 */
export default function SwapButton({ disabled }: { disabled: boolean }) {
  const { account, chainId } = useWeb3React()
  const {
    [Field.INPUT]: { usdc: inputUSDC },
    [Field.OUTPUT]: { usdc: outputUSDC },
    trade: { trade, gasUseEstimateUSD },
    approval,
    allowance,
    slippage,
    impact,
  } = useSwapInfo()
  const deadline = useTransactionDeadline()
  const feeOptions = useAtomValue(feeOptionsAtom)
  const color = useTokenColorExtraction()

  const permit2Enabled = usePermit2Enabled()
  const { callback: swapRouterCallback } = useSwapCallback({
    trade: permit2Enabled ? undefined : trade,
    allowedSlippage: slippage.allowed,
    recipientAddressOrName: account ?? null,
    signatureData: approval?.signatureData,
    deadline,
    feeOptions,
  })
  const universalRouterSwapCallback = useUniversalRouterSwapCallback(permit2Enabled ? trade : undefined, {
    slippageTolerance: slippage.allowed,
    deadline,
    permit: allowance.state === AllowanceState.ALLOWED ? allowance.permitSignature : undefined,
    feeOptions,
  })
  const swapCallback = permit2Enabled ? universalRouterSwapCallback : swapRouterCallback

  const [open, setOpen] = useState(false)
  // Close the review modal if there is no available trade.
  useEffect(() => setOpen((open) => (trade ? open : false)), [trade])
  // Close the review modal on chain change.
  useEffect(() => setOpen(false), [chainId])

  const setOldestValidBlock = useSetOldestValidBlock()
  const onSubmit = useOnSubmit()
  const throwAsync = useAsyncError()
  const onSwap = useCallback(async () => {
    try {
      const submitted = await onSubmit(async () => {
        const response = await swapCallback?.()
        if (!response) return

        // Set the block containing the response to the oldest valid block to ensure that the
        // completed trade's impact is reflected in future fetched trades.
        response.wait(1).then((receipt) => {
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
      if (submitted) {
        setOpen(false)
      }
    } catch (e) {
      throwAsync(e)
    }
  }, [onSubmit, setOldestValidBlock, slippage.allowed, swapCallback, throwAsync, trade])

  const onReviewSwapClick = useConditionalHandler(useAtomValue(swapEventHandlersAtom).onReviewSwapClick)
  const collapseToolbar = useCollapseToolbar()
  const onClick = useCallback(async () => {
    collapseToolbar()
    setOpen(await onReviewSwapClick())
  }, [onReviewSwapClick, collapseToolbar])

  const isMobile = useIsMobileWidth()
  const pageCenteredDialogsEnabled = useIsDialogPageCentered()

  return (
    <>
      <ActionButton color={color} onClick={onClick} disabled={disabled}>
        <Trans>Review swap</Trans>
      </ActionButton>
      {trade &&
        (isMobile && pageCenteredDialogsEnabled ? (
          <BottomSheetModal onClose={() => setOpen(false)} open={open && Boolean(trade)}>
            <SummaryDialog
              trade={trade}
              slippage={slippage}
              gasUseEstimateUSD={gasUseEstimateUSD}
              inputUSDC={inputUSDC}
              outputUSDC={outputUSDC}
              impact={impact}
              onConfirm={onSwap}
              allowance={allowance}
            />
          </BottomSheetModal>
        ) : (
          open && (
            <Dialog color="container" onClose={() => setOpen(false)}>
              <SummaryDialog
                trade={trade}
                slippage={slippage}
                gasUseEstimateUSD={gasUseEstimateUSD}
                inputUSDC={inputUSDC}
                outputUSDC={outputUSDC}
                impact={impact}
                onConfirm={onSwap}
                allowance={allowance}
              />
            </Dialog>
          )
        ))}
    </>
  )
}
