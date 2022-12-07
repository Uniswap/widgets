import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useSwapInfo } from 'hooks/swap'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { useSwapCallback } from 'hooks/swap/useSwapCallback'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { useSetOldestValidBlock } from 'hooks/useIsValidBlock'
import { PermitState } from 'hooks/usePermit2'
import { usePermit2 } from 'hooks/useSyncFlags'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useUniversalRouterSwapCallback } from 'hooks/useUniversalRouter'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useEffect, useState } from 'react'
import { feeOptionsAtom, Field, swapEventHandlersAtom } from 'state/swap'
import { ApprovalTransactionInfo, SwapTransactionInfo, TransactionType } from 'state/transactions'
import { Colors } from 'theme'
import invariant from 'tiny-invariant'

import ActionButton from '../../ActionButton'
import Dialog from '../../Dialog'
import { SummaryDialog } from '../Summary'
import ApproveButton from './ApproveButton'
import PermitButton from './Permit2Button'

/**
 * A swapping ActionButton.
 * Should only be rendered if a valid swap exists.
 */
export default function SwapButton({
  color,
  disabled,
  onSubmit,
}: {
  color: keyof Colors
  disabled: boolean
  onSubmit: (submit?: () => Promise<ApprovalTransactionInfo | SwapTransactionInfo | void>) => Promise<void>
}) {
  const { account, chainId } = useWeb3React()
  const {
    [Field.INPUT]: { usdc: inputUSDC },
    [Field.OUTPUT]: { usdc: outputUSDC },
    trade: { trade, gasUseEstimateUSD },
    approval,
    permit,
    slippage,
    impact,
  } = useSwapInfo()
  const deadline = useTransactionDeadline()
  const feeOptions = useAtomValue(feeOptionsAtom)

  const permit2 = usePermit2()
  const { callback: swapRouterCallback } = useSwapCallback({
    trade: permit2 ? undefined : trade,
    allowedSlippage: slippage.allowed,
    recipientAddressOrName: account ?? null,
    signatureData: approval?.signatureData,
    deadline,
    feeOptions,
  })
  const universalRouterSwapCallback = useUniversalRouterSwapCallback(permit2 ? trade : undefined, {
    slippageTolerance: slippage.allowed,
    deadline,
    permit: permit.signature,
    feeOptions,
  })
  const swapCallback = permit2 ? universalRouterSwapCallback : swapRouterCallback

  const [open, setOpen] = useState(false)
  // Close the review modal if there is no available trade.
  useEffect(() => setOpen((open) => (trade ? open : false)), [trade])
  // Close the review modal on chain change.
  useEffect(() => setOpen(false), [chainId])

  const setOldestValidBlock = useSetOldestValidBlock()
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
      setOpen(false)
    } catch (e) {
      console.error(e) // ignore error
    }
  }, [onSubmit, setOldestValidBlock, slippage.allowed, swapCallback, trade])

  const onReviewSwapClick = useConditionalHandler(useAtomValue(swapEventHandlersAtom).onReviewSwapClick)
  const onClick = useCallback(async () => {
    setOpen(await onReviewSwapClick())
  }, [onReviewSwapClick])

  if (usePermit2()) {
    if (![PermitState.UNKNOWN, PermitState.PERMITTED].includes(permit.state)) {
      return <PermitButton color={color} onSubmit={onSubmit} trade={trade} {...permit} />
    }
  } else {
    if (approval.state !== SwapApprovalState.APPROVED && !disabled) {
      return <ApproveButton color={color} onSubmit={onSubmit} trade={trade} {...approval} />
    }
  }

  return (
    <>
      <ActionButton color={color} onClick={onClick} disabled={disabled}>
        <Trans>Review swap</Trans>
      </ActionButton>
      {open && trade && (
        <Dialog color="dialog" onClose={() => setOpen(false)}>
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
