import { useWeb3React } from '@web3-react/core'
import { useSwapInfo } from 'hooks/swap'
import { ApproveOrPermitState, useApproveOrPermit } from 'hooks/swap/useSwapApproval'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { memo, useMemo } from 'react'
import { Field } from 'state/swap'
import { useTheme } from 'styled-components/macro'

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
    trade: { trade },
    slippage,
  } = useSwapInfo()

  const tokenChainId = inputCurrency?.chainId ?? outputCurrency?.chainId

  const approval = useApproveOrPermit(trade, slippage.allowed, useIsPendingApproval, inputCurrencyAmount)
  const onSubmit = useOnSubmit()

  const isWrap = useIsWrap()
  const isDisabled = useMemo(
    () =>
      disabled ||
      !chainId ||
      (!isWrap && !trade) ||
      !(inputCurrencyAmount && inputCurrencyBalance) ||
      inputCurrencyBalance.lessThan(inputCurrencyAmount),
    [disabled, chainId, isWrap, trade, inputCurrencyAmount, inputCurrencyBalance]
  )

  const { tokenColorExtraction } = useTheme()
  const color = tokenColorExtraction ? 'interactive' : 'accent'

  if (chainId && tokenChainId && chainId !== tokenChainId) {
    return <SwitchChainButton color={color} chainId={tokenChainId} />
  } else if (isWrap) {
    return <WrapButton color={color} onSubmit={onSubmit} disabled={isDisabled} />
  } else if (approval.approvalState !== ApproveOrPermitState.APPROVED) {
    return <ApproveButton color={color} onSubmit={onSubmit} trade={trade} {...approval} />
  } else {
    return <SwapButton color={color} onSubmit={onSubmit} signatureData={approval.signatureData} disabled={isDisabled} />
  }
})
