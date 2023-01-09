import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { ChainError, useSwapInfo } from 'hooks/swap'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { AllowanceState } from 'hooks/usePermit2Allowance'
import { usePermit2 as usePermit2Enabled } from 'hooks/useSyncFlags'
import { useMemo } from 'react'
import { Field } from 'state/swap'

import ConnectWalletButton from './ConnectWalletButton'
import SwapButton from './SwapButton'
import SwitchChainButton from './SwitchChainButton'
import WrapButton from './WrapButton'

export default function SwapActionButton() {
  const { account, isActive } = useWeb3React()
  const {
    [Field.INPUT]: { currency: inputCurrency, amount: inputCurrencyAmount, balance: inputCurrencyBalance },
    [Field.OUTPUT]: { currency: outputCurrency },
    error,
    approval,
    allowance,
    trade: { trade },
  } = useSwapInfo()
  const isWrap = useIsWrap()
  const permit2Enabled = usePermit2Enabled()
  const isDisabled = useMemo(
    () =>
      (permit2Enabled && allowance.state === AllowanceState.REQUIRED) ||
      (!permit2Enabled && approval.state !== SwapApprovalState.APPROVED) ||
      error !== undefined ||
      (!isWrap && !trade) ||
      !(inputCurrencyAmount && inputCurrencyBalance) ||
      inputCurrencyBalance.lessThan(inputCurrencyAmount),
    [permit2Enabled, allowance.state, approval.state, error, isWrap, trade, inputCurrencyAmount, inputCurrencyBalance]
  )

  if (!account || !isActive) {
    return <ConnectWalletButton />
  } else if (error === ChainError.MISMATCHED_CHAINS) {
    const tokenChainId = inputCurrency?.chainId ?? outputCurrency?.chainId ?? SupportedChainId.MAINNET
    return <SwitchChainButton chainId={tokenChainId} />
  } else if (isWrap) {
    return <WrapButton disabled={isDisabled} />
  } else {
    return <SwapButton disabled={isDisabled} />
  }
}
