import { ChainError, useIsAmountPopulated, useSwapInfo } from 'hooks/swap'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { AllowanceState } from 'hooks/usePermit2Allowance'
import { usePermit2 as usePermit2Enabled } from 'hooks/useSyncFlags'
import { memo, useMemo } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'

import Row from '../../Row'
import AllowanceButton from '../SwapActionButton/AllowanceButton'
import ApproveButton from '../SwapActionButton/ApproveButton'
import * as Caption from './Caption'

const ToolbarRow = styled(Row)`
  border: 1px solid ${({ theme }) => theme.outline};
  border-radius: ${({ theme }) => theme.borderRadius - 0.25}em;
  gap: 0.5em;
  min-height: 3.5em;
  padding: 0 1em;
`

export default memo(function Toolbar() {
  const {
    [Field.INPUT]: { currency: inputCurrency, balance: inputBalance, amount: inputAmount },
    [Field.OUTPUT]: { currency: outputCurrency, usdc: outputUSDC },
    error,
    approval,
    allowance,
    trade: { trade, state },
    impact,
  } = useSwapInfo()
  const isAmountPopulated = useIsAmountPopulated()
  const isWrap = useIsWrap()
  const permit2Enabled = usePermit2Enabled()

  const caption = useMemo(() => {
    switch (error) {
      case ChainError.ACTIVATING_CHAIN:
        return <Caption.Connecting />
      case ChainError.UNSUPPORTED_CHAIN:
        return <Caption.UnsupportedNetwork />
      case ChainError.MISMATCHED_TOKEN_CHAINS:
        return <Caption.Error />
      case ChainError.MISMATCHED_CHAINS:
        return
      default:
    }

    if (state === TradeState.LOADING) {
      return <Caption.LoadingTrade />
    }

    if (inputCurrency && outputCurrency && isAmountPopulated) {
      if (inputBalance && inputAmount?.greaterThan(inputBalance)) {
        return <Caption.InsufficientBalance currency={inputCurrency} />
      }
      if (isWrap) {
        return <Caption.WrapCurrency inputCurrency={inputCurrency} outputCurrency={outputCurrency} />
      }
      if (state === TradeState.NO_ROUTE_FOUND || (trade && !trade.swaps)) {
        return <Caption.InsufficientLiquidity />
      }
      if (trade?.inputAmount && trade.outputAmount) {
        return <Caption.Trade trade={trade} outputUSDC={outputUSDC} impact={impact} />
      }
      if (state === TradeState.INVALID) {
        return <Caption.Error />
      }
    }

    return <Caption.MissingInputs />
  }, [
    error,
    state,
    inputCurrency,
    outputCurrency,
    isAmountPopulated,
    inputBalance,
    inputAmount,
    isWrap,
    trade,
    outputUSDC,
    impact,
  ])

  if (inputCurrency == null || outputCurrency == null) {
    return null
  }

  if (permit2Enabled) {
    if (allowance.state === AllowanceState.REQUIRED) {
      return <AllowanceButton {...allowance} />
    }
  } else {
    if (approval.state !== SwapApprovalState.APPROVED) {
      return <ApproveButton trade={trade} {...approval} />
    }
  }

  return (
    <ToolbarRow flex justify="flex-start" data-testid="toolbar" gap={3 / 8}>
      {caption}
    </ToolbarRow>
  )
})
