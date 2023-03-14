import { SupportedChainId } from 'constants/chains'
import { ChainError, useSwapInfo } from 'hooks/swap'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { useEvmAccountAddress, useSnAccountAddress } from 'hooks/useSyncWidgetSettings'
import { useMemo } from 'react'
import { Field } from 'state/swap'
import { isStarknetChain } from 'utils/starknet'

import ConnectWalletButton from './ConnectWalletButton'
import SwapButton from './SwapButton'
import SwitchChainButton from './SwitchChainButton'
import WrapButton from './WrapButton'

export default function SwapActionButton() {
  const account = useEvmAccountAddress()
  const snAccount = useSnAccountAddress()
  const {
    [Field.INPUT]: { currency: inputCurrency, amount: inputCurrencyAmount, balance: inputCurrencyBalance },
    [Field.OUTPUT]: { currency: outputCurrency },
    error,
    approval,
    trade: { trade },
  } = useSwapInfo()
  const isWrap = useIsWrap()
  const isDisabled = useMemo(
    () =>
      approval.state !== SwapApprovalState.APPROVED ||
      error !== undefined ||
      (!isWrap && !trade) ||
      !(inputCurrencyAmount && inputCurrencyBalance) ||
      inputCurrencyBalance.lessThan(inputCurrencyAmount),
    [approval.state, error, isWrap, trade, inputCurrencyAmount, inputCurrencyBalance]
  )
  const srcWalletConnected = isStarknetChain(inputCurrency?.chainId) ? snAccount : account
  const dstWalletConnected = isStarknetChain(outputCurrency?.chainId) ? snAccount : account

  if (!inputCurrency && !outputCurrency) {
    return <SwapButton disabled={isDisabled} />
  } else if (inputCurrency && !srcWalletConnected) {
    return <ConnectWalletButton chainId={inputCurrency.chainId} />
  } else if (outputCurrency && !dstWalletConnected) {
    return <ConnectWalletButton chainId={outputCurrency.chainId} />
  } else if (error === ChainError.MISMATCHED_CHAINS) {
    const tokenChainId = inputCurrency?.chainId ?? outputCurrency?.chainId ?? SupportedChainId.MAINNET
    return <SwitchChainButton chainId={tokenChainId} />
  } else if (isWrap) {
    return <WrapButton disabled={isDisabled} />
  } else {
    return <SwapButton disabled={isDisabled} />
  }
}
