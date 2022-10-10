import { useWeb3React } from '@web3-react/core'
import { ChainError, useIsAmountPopulated, useSwapInfo } from 'hooks/swap'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { largeIconCss } from 'icons'
import { memo, useMemo } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Row from '../../Row'
import * as Caption from './Caption'

const ToolbarRow = styled(Row)`
  background-color: ${({ theme }) => theme.module};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius - 0.25}em;
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius - 0.25}em;
  padding: 14px 16px;
  ${largeIconCss}
`

export default memo(function Toolbar() {
  const { account } = useWeb3React()
  const {
    [Field.INPUT]: { currency: inputCurrency, balance: inputBalance, amount: inputAmount },
    [Field.OUTPUT]: { currency: outputCurrency, usdc: outputUSDC },
    error,
    trade: { trade, state },
    impact,
  } = useSwapInfo()
  const isAmountPopulated = useIsAmountPopulated()
  const isWrap = useIsWrap()
  const caption = useMemo(() => {
    switch (error) {
      case ChainError.UNCONNECTED_CHAIN:
        return <Caption.ConnectWallet />
      case ChainError.ACTIVATING_CHAIN:
        return <Caption.ConnectWallet />
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

    if (!account) {
      return <Caption.ConnectWallet />
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

    return <Caption.Empty />
  }, [
    error,
    state,
    account,
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

  return (
    <ThemedText.Caption data-testid="toolbar">
      <ToolbarRow justify="flex-start" gap={0.5} iconSize={4 / 3}>
        {caption}
      </ToolbarRow>
    </ThemedText.Caption>
  )
})
