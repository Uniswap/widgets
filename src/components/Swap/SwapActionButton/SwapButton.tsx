import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { ALLOWED_PRICE_IMPACT_HIGH } from 'constants/misc'
import { useSwapInfo } from 'hooks/swap'
import { useSwapCallback } from 'hooks/swap/useSwapCallback'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
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
import Dialog from '../../Dialog'
import { SpeedbumpDialog } from '../Speedbump'
import { SummaryDialog } from '../Summary'
import useOnSubmit from './useOnSubmit'

enum VIEW {
  DEFAULT,
  IMPACT_SPEEDBUMP,
  SWAP_REVIEW,
}

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

  const [view, setView] = useState(VIEW.DEFAULT)
  // Close the review modal if there is no available trade.
  useEffect(() => setView((view) => (trade ? view : VIEW.DEFAULT)), [trade])
  // Close the review modal on chain change.
  useEffect(() => setView(VIEW.DEFAULT), [chainId])

  const setOldestValidBlock = useSetOldestValidBlock()
  const onSubmit = useOnSubmit()
  const onSwap = useCallback(async () => {
    try {
      await onSubmit(async () => {
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
      setView(VIEW.DEFAULT)
    } catch (e) {
      console.error(e) // ignore error
    }
  }, [onSubmit, setOldestValidBlock, slippage.allowed, swapCallback, trade])

  const onReviewSwapClick = useConditionalHandler(useAtomValue(swapEventHandlersAtom).onReviewSwapClick)
  const onContinue = useCallback(async () => {
    setView((await onReviewSwapClick()) ? VIEW.SWAP_REVIEW : VIEW.DEFAULT)
  }, [onReviewSwapClick])

  const onClick = useCallback(() => {
    if (view === VIEW.DEFAULT && impact?.percent.greaterThan(ALLOWED_PRICE_IMPACT_HIGH)) {
      setView(VIEW.IMPACT_SPEEDBUMP)
    } else onContinue()
  }, [impact?.percent, onContinue, view])

  return (
    <>
      <ActionButton color={color} onClick={onClick} disabled={disabled}>
        <Trans>Review swap</Trans>
      </ActionButton>
      {view === VIEW.SWAP_REVIEW && trade && (
        <Dialog color="dialog" onClose={() => setView(VIEW.DEFAULT)}>
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
      {view === VIEW.IMPACT_SPEEDBUMP && impact && (
        <Dialog color="dialog" onClose={() => setView(VIEW.DEFAULT)}>
          <SpeedbumpDialog onContinue={() => onContinue()} onClose={() => setView(VIEW.DEFAULT)} impact={impact} />
        </Dialog>
      )}
    </>
  )
}
