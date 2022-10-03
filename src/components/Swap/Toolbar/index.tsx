import { useSwapInfo } from 'hooks/swap'
import { SwapError } from 'hooks/swap/useSwapInfo'
import { largeIconCss } from 'icons'
import { memo, useMemo } from 'react'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import invariant from 'tiny-invariant'

import Row from '../../Row'
import * as Caption from './Caption'

const ToolbarRow = styled(Row)`
  padding: 0.5em 0;
  ${largeIconCss}
`

export default memo(function Toolbar() {
  const {
    [Field.INPUT]: { currency: inputCurrency },
    [Field.OUTPUT]: { currency: outputCurrency, usdc: outputUSDC },
    error,
    trade,
  } = useSwapInfo()
  const caption = useMemo(() => {
    switch (error) {
      case SwapError.LOADING:
        return <Caption.LoadingTrade />
      case SwapError.WALLET_DISCONNECTED:
        return <Caption.ConnectWallet />
      case SwapError.WALLET_CONNECTING:
        return <Caption.Connecting />
      case SwapError.UNSUPPORTED_CHAIN:
        return <Caption.UnsupportedNetwork />
      case SwapError.MISSING_INPUTS:
        return <Caption.Empty />
      case SwapError.INSUFFICIENT_BALANCE:
        invariant(inputCurrency)
        return <Caption.InsufficientBalance currency={inputCurrency} />
      case SwapError.INSUFFICIENT_LIQUIDITY:
        return <Caption.InsufficientLiquidity />
      case SwapError.UNKNOWN:
        return <Caption.Error />
      case undefined:
        invariant(inputCurrency && outputCurrency)
        if (trade) {
          invariant(trade.trade)
          return <Caption.Trade trade={trade.trade} outputUSDC={outputUSDC} impact={trade.impact} />
        } else {
          return <Caption.WrapCurrency inputCurrency={inputCurrency} outputCurrency={outputCurrency} />
        }
    }
  }, [error, inputCurrency, outputCurrency, trade, outputUSDC])

  return (
    <ThemedText.Caption data-testid="toolbar">
      <ToolbarRow justify="flex-start" gap={0.5} iconSize={4 / 3}>
        {caption}
      </ToolbarRow>
    </ThemedText.Caption>
  )
})
