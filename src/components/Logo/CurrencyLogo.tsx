import { Currency } from '@uniswap/sdk-core'
import { TokenInfo } from '@uniswap/token-lists'

import Logo, { LogoBasePops } from './Logo'

export default function CurrencyLogo(
  props: LogoBasePops & {
    currency?: Currency | null
  }
) {
  return (
    <Logo
      isNative={props.currency?.isNative}
      chainId={props.currency?.chainId}
      address={props.currency?.wrapped.address}
      symbol={props.symbol ?? props.currency?.symbol}
      backupImg={(props.currency as TokenInfo)?.logoURI}
      {...props}
    />
  )
}
