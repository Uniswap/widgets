import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useSwapInfo } from 'hooks/swap'
import { memo } from 'react'
import { Field } from 'state/swap'
import { useTheme } from 'styled-components/macro'

import ActionButton from '../../ActionButton'
import SwitchChainButton from './SwitchChainButton'
import TradeButton from './TradeButton'
import useOnSubmit from './useOnSubmit'
import WrapButton from './WrapButton'

interface SwapButtonProps {
  disabled?: boolean
}

export default memo(function SwapActionButton({ disabled }: SwapButtonProps) {
  const { chainId } = useWeb3React()
  const {
    [Field.INPUT]: { currency: inputCurrency },
    [Field.OUTPUT]: { currency: outputCurrency },
    error,
    trade,
  } = useSwapInfo()

  const tokenChainId = inputCurrency?.chainId ?? outputCurrency?.chainId

  const onSubmit = useOnSubmit()

  const { tokenColorExtraction } = useTheme()
  const color = tokenColorExtraction ? 'interactive' : 'accent'

  if (chainId && tokenChainId && chainId !== tokenChainId) {
    return <SwitchChainButton color={color} chainId={tokenChainId} />
  } else if (disabled || !chainId) {
    return <DisabledButton color={color} />
  } else if (trade) {
    return <TradeButton color={color} onSubmit={onSubmit} trade={trade} disabled={error !== undefined} />
  } else {
    return <WrapButton color={color} onSubmit={onSubmit} disabled={error !== undefined} />
  }
})

function DisabledButton({ color }: { color: 'interactive' | 'accent' }) {
  return (
    <ActionButton color={color} disabled={true}>
      <Trans>Review swap</Trans>
    </ActionButton>
  )
}
