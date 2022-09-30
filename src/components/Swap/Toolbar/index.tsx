import { useWeb3React } from '@web3-react/core'
import { ALL_SUPPORTED_CHAIN_IDS } from 'constants/chains'
import { useIsAmountPopulated, useSwapInfo } from 'hooks/swap'
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
  padding: 0.5em 0;
  ${largeIconCss}
`

export default memo(function Toolbar() {
  const { account, isActivating, chainId } = useWeb3React()
  const {
    [Field.INPUT]: { currency: inputCurrency, balance: inputBalance, amount: inputAmount },
    [Field.OUTPUT]: { currency: outputCurrency, usdc: outputUSDC },
    trade: { trade, state },
    impact,
  } = useSwapInfo()
  const tokenChainId = inputCurrency?.chainId ?? outputCurrency?.chainId
  const isAmountPopulated = useIsAmountPopulated()
  const isWrap = useIsWrap()
  const caption = useMemo(() => {
    if (state === TradeState.SYNCING || state === TradeState.LOADING) {
      return <Caption.LoadingTrade />
    }

    if (chainId && tokenChainId && chainId !== tokenChainId) {
      return <Caption.Empty />
    }

    if (!account || !chainId) {
      if (isActivating) return <Caption.Connecting />
      return <Caption.ConnectWallet />
    }

    if (!ALL_SUPPORTED_CHAIN_IDS.includes(chainId)) {
      return <Caption.UnsupportedNetwork />
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
    state,
    chainId,
    tokenChainId,
    account,
    inputCurrency,
    outputCurrency,
    isAmountPopulated,
    isActivating,
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
