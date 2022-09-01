import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useSwapInfo } from 'hooks/swap'
import { ApproveOrPermitState, useApproveOrPermit, useSwapApprovalOptimizedTrade } from 'hooks/swap/useSwapApproval'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { memo, useMemo } from 'react'
import { Field } from 'state/swap'
import { useTheme } from 'styled-components/macro'

import ActionButton from '../../ActionButton'
import ApproveButton, { useIsPendingApproval } from './ApproveButton'
import SwapButton from './SwapButton'
import useOnSubmit from './useOnSubmit'
import WrapButton from './WrapButton'

interface SwapButtonProps {
  disabled?: boolean
}

export default memo(function SwapActionButton({ disabled }: SwapButtonProps) {
  const { chainId } = useWeb3React()
  const {
    [Field.INPUT]: { amount: inputCurrencyAmount, balance: inputCurrencyBalance },
    trade,
    slippage,
  } = useSwapInfo()

  const isWrap = useIsWrap()
  // TODO(zzmp): Return an optimized trade directly from useSwapInfo.
  const optimizedTrade =
    // Use trade.trade if there is no swap optimized trade. This occurs if approvals are still pending.
    useSwapApprovalOptimizedTrade(trade.trade, slippage.allowed, useIsPendingApproval) || trade.trade
  const approval = useApproveOrPermit(optimizedTrade, slippage.allowed, useIsPendingApproval, inputCurrencyAmount)

  const isDisabled = useMemo(
    () =>
      disabled ||
      !chainId ||
      (!isWrap && !optimizedTrade) ||
      !(inputCurrencyAmount && inputCurrencyBalance) ||
      inputCurrencyBalance.lessThan(inputCurrencyAmount),
    [disabled, chainId, isWrap, optimizedTrade, inputCurrencyAmount, inputCurrencyBalance]
  )

  const onSubmit = useOnSubmit()
  const { tokenColorExtraction } = useTheme()

  if (isDisabled) {
    return (
      <ActionButton color={tokenColorExtraction ? 'interactive' : 'accent'} disabled={true}>
        <Trans>Review swap</Trans>
      </ActionButton>
    )
  } else if (isWrap) {
    return <WrapButton onSubmit={onSubmit} />
  } else if (approval.approvalState !== ApproveOrPermitState.APPROVED) {
    return <ApproveButton onSubmit={onSubmit} trade={trade.trade} {...approval} />
  } else {
    return <SwapButton onSubmit={onSubmit} optimizedTrade={optimizedTrade} signatureData={approval.signatureData} />
  }
})
