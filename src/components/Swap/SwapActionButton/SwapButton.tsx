import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useAsyncError } from 'components/Error/ErrorBoundary'
import { useSwapInfo } from 'hooks/swap'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { useSetOldestValidBlock } from 'hooks/useIsValidBlock'
import { AllowanceState } from 'hooks/usePermit2Allowance'
import useTokenColorExtraction from 'hooks/useTokenColorExtraction'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useUniversalRouterSwapCallback } from 'hooks/useUniversalRouter'
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
  const { chainId } = useWeb3React()
  const {
    [Field.INPUT]: { usdc: inputUSDC },
    [Field.OUTPUT]: { usdc: outputUSDC },
    trade: { trade, gasUseEstimateUSD },
    allowance,
    slippage,
    impact,
  } = useSwapInfo()
  const deadline = useTransactionDeadline()
  const feeOptions = useAtomValue(feeOptionsAtom)
  const color = useTokenColorExtraction()

  const universalRouterSwapCallback = useUniversalRouterSwapCallback(trade, {
    slippageTolerance: slippage.allowed,
    deadline,
    permit: allowance.state === AllowanceState.ALLOWED ? allowance.permitSignature : undefined,
    feeOptions,
  })

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
      await onSubmit(async () => {
        const response = await universalRouterSwapCallback?.()
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
      setOpen(false)
    } catch (e) {
      throwAsync(e)
    }
  }, [onSubmit, setOldestValidBlock, slippage.allowed, throwAsync, trade, universalRouterSwapCallback])

  const onReviewSwapClick = useConditionalHandler(useAtomValue(swapEventHandlersAtom).onReviewSwapClick)
  const collapseToolbar = useCollapseToolbar()
  const onClick = useCallback(async () => {
    collapseToolbar()
    setOpen(await onReviewSwapClick())
  }, [onReviewSwapClick, collapseToolbar])

  return (
    <>
      <ActionButton color={color} onClick={onClick} disabled={disabled}>
        <Trans>Review swap</Trans>
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
            allowance={allowance}
          />
        </Dialog>
      )}
    </>
  )
}
