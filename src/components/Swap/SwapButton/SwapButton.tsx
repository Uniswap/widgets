import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useSwapInfo } from 'hooks/swap'
import { useSwapApprovalOptimizedTrade } from 'hooks/swap/useSwapApproval'
import { useSwapCallback } from 'hooks/swap/useSwapCallback'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { SignatureData } from 'hooks/useERC20Permit'
import { useSetOldestValidBlock } from 'hooks/useIsValidBlock'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useEffect, useState } from 'react'
import { feeOptionsAtom, Field, swapEventHandlersAtom } from 'state/swap'
import { SwapTransactionInfo, TransactionType } from 'state/transactions'
import { useTheme } from 'styled-components/macro'
import invariant from 'tiny-invariant'

import ActionButton from '../../ActionButton'
import Dialog from '../../Dialog'
import { SummaryDialog } from '../Summary'

export default function SwapButton({
  onSubmit,
  optimizedTrade,
  signatureData,
}: {
  onSubmit: (submit: () => Promise<SwapTransactionInfo | undefined>) => Promise<boolean>
  optimizedTrade: ReturnType<typeof useSwapApprovalOptimizedTrade>
  signatureData: SignatureData | null
}) {
  const { account, chainId } = useWeb3React()
  const {
    [Field.INPUT]: { usdc: inputUSDC },
    [Field.OUTPUT]: { usdc: outputUSDC },
    trade: { trade },
    slippage,
    impact,
  } = useSwapInfo()
  const feeOptions = useAtomValue(feeOptionsAtom)
  const deadline = useTransactionDeadline()

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
  useEffect(() => setOpen((open) => (trade ? open : false)), [trade])
  // Close the review modal on chain change.
  useEffect(() => setOpen(false), [chainId])

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

      invariant(trade)
      return {
        type: TransactionType.SWAP,
        response,
        tradeType: trade.tradeType,
        trade,
        slippageTolerance: slippage.allowed,
      }
    })

    // Only close the review modal if the transaction has submitted.
    if (submitted) {
      setOpen(false)
    }
  }, [onSubmit, setOldestValidBlock, slippage.allowed, swapCallback, trade])

  const onReviewSwapClick = useConditionalHandler(useAtomValue(swapEventHandlersAtom).onReviewSwapClick)
  const onClick = useCallback(async () => {
    setOpen(await onReviewSwapClick())
  }, [onReviewSwapClick])

  const { tokenColorExtraction } = useTheme()

  return (
    <>
      <ActionButton color={tokenColorExtraction ? 'interactive' : 'accent'} onClick={onClick}>
        <Trans>Review swap</Trans>
      </ActionButton>
      {open && trade && (
        <Dialog color="dialog" onClose={() => setOpen(false)}>
          <SummaryDialog
            trade={trade}
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
}
