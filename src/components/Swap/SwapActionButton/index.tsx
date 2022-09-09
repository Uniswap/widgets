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
import SwitchChainButton from './SwitchChainButton'
import useOnSubmit from './useOnSubmit'
import WrapButton from './WrapButton'

interface SwapButtonProps {
  disabled?: boolean
}

export default memo(function SwapActionButton({ disabled }: SwapButtonProps) {
  const { chainId } = useWeb3React()
  const {
    [Field.INPUT]: { currency: inputCurrency, amount: inputCurrencyAmount, balance: inputCurrencyBalance },
    [Field.OUTPUT]: { currency: outputCurrency },
    trade,
    slippage,
  } = useSwapInfo()

  const tokenChainId = inputCurrency?.chainId ?? outputCurrency?.chainId

  // TODO(zzmp): Return an optimized trade directly from useSwapInfo.
  const optimizedTrade =
    // Use trade.trade if there is no swap optimized trade. This occurs if approvals are still pending.
    useSwapApprovalOptimizedTrade(trade.trade, slippage.allowed, useIsPendingApproval) || trade.trade
  const approval = useApproveOrPermit(optimizedTrade, slippage.allowed, useIsPendingApproval, inputCurrencyAmount)
  const onSubmit = useOnSubmit()

  const isWrap = useIsWrap()
  const isDisabled = useMemo(
    () =>
      disabled ||
      !chainId ||
      (!isWrap && !optimizedTrade) ||
      !(inputCurrencyAmount && inputCurrencyBalance) ||
      inputCurrencyBalance.lessThan(inputCurrencyAmount),
    [disabled, chainId, isWrap, optimizedTrade, inputCurrencyAmount, inputCurrencyBalance]
  )

  const { tokenColorExtraction } = useTheme()
  const color = tokenColorExtraction ? 'interactive' : 'accent'

  if (chainId && tokenChainId && chainId !== tokenChainId) {
    return <SwitchChainButton color={color} chainId={tokenChainId} />
  } else if (isDisabled) {
    return (
      <ActionButton color={color} disabled={true}>
        <Trans>Review swap</Trans>
      </ActionButton>
    )
  } else if (isWrap) {
    return <WrapButton color={color} onSubmit={onSubmit} />
  } else if (approval.approvalState !== ApproveOrPermitState.APPROVED) {
    return <ApproveButton color={color} onSubmit={onSubmit} trade={trade.trade} {...approval} />
  } else {
    return (
      <SwapButton
        color={color}
        onSubmit={onSubmit}
        optimizedTrade={optimizedTrade}
        signatureData={approval.signatureData}
      />
    )
  }
})
