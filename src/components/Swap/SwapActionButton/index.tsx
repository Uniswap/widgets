import { SupportedChainId } from 'constants/chains'
import { ChainError, useSwapInfo } from 'hooks/swap'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { useMemo } from 'react'
import { Field } from 'state/swap'
import { useTheme } from 'styled-components/macro'

import SwapButton from './SwapButton'
import SwitchChainButton from './SwitchChainButton'
import useOnSubmit from './useOnSubmit'
import WrapButton from './WrapButton'

export default function SwapActionButton() {
  const {
    [Field.INPUT]: { currency: inputCurrency, amount: inputCurrencyAmount, balance: inputCurrencyBalance },
    [Field.OUTPUT]: { currency: outputCurrency },
    error,
    trade: { trade },
  } = useSwapInfo()
  const isWrap = useIsWrap()
  const isDisabled = useMemo(
    () =>
      error !== undefined ||
      (!isWrap && !trade) ||
      !(inputCurrencyAmount && inputCurrencyBalance) ||
      inputCurrencyBalance.lessThan(inputCurrencyAmount),
    [error, isWrap, trade, inputCurrencyAmount, inputCurrencyBalance]
  )
  const onSubmit = useOnSubmit()

  const { tokenColorExtraction } = useTheme()
  const color = tokenColorExtraction ? 'interactive' : 'accent'

  if (error === ChainError.MISMATCHED_CHAINS) {
    const tokenChainId = inputCurrency?.chainId ?? outputCurrency?.chainId ?? SupportedChainId.MAINNET
    return <SwitchChainButton color={color} chainId={tokenChainId} />
  } else if (isWrap) {
    return <WrapButton color={color} onSubmit={onSubmit} disabled={isDisabled} />
  } else {
    return <SwapButton color={color} onSubmit={onSubmit} disabled={isDisabled} />
  }
}
