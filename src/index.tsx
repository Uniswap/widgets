import 'polyfills'

import { TransactionReceipt, Web3Provider } from '@ethersproject/providers'
import { Currency } from '@uniswap/sdk-core'
import Swap from 'components/Swap'
import Widget from 'components/Widget'
import { AddEthereumChainParameter } from 'hooks/useSwitchChain'
import { ErrorInfo } from 'react'
import { AccountInterface } from 'starknet'
import { Transaction } from 'state/transactions'
import { Theme } from 'theme'
export type { SwapWidgetSkeletonProps } from 'components/Swap/Skeleton'
export { SwapWidgetSkeleton } from 'components/Swap/Skeleton'
export type { SupportedLocale } from 'constants/locales'
export { DEFAULT_LOCALE, SUPPORTED_LOCALES } from 'constants/locales'
export type { Theme } from 'theme'
export { darkTheme, defaultTheme, lightTheme } from 'theme'
export { isStarknetChain } from 'utils/starknet'
export type {
  AccountInterface,
  AddEthereumChainParameter,
  Currency,
  ErrorInfo,
  Transaction,
  TransactionReceipt,
  Web3Provider,
}

export type WidoWidgetProps = {
  // WidgetSettings
  ethProvider?: Web3Provider
  snAccount?: AccountInterface
  toTokens?: { chainId: number; address: string }[]
  fromTokens?: { chainId: number; address: string }[]
  testnetsVisible?: boolean
  partner?: string

  // WidgetProps
  theme?: Theme
  width?: string | number
  className?: string

  // TransactionEventHandlers
  onFromTokenChange?: (token: Currency) => void
  onToTokenChange?: (token: Currency) => void
  onTxSubmit?: (hash: string, tx: Transaction) => void
  onTxSuccess?: (hash: string, receipt: TransactionReceipt) => void
  onTxFail?: (hash: string, receipt: TransactionReceipt) => void

  // WidgetEventHandlers
  onConnectWalletClick?: (chainId: number) => void | boolean | Promise<boolean>
  onError?: (error: Error, info?: ErrorInfo) => void
  onSwitchChain?: (addChainParameter: AddEthereumChainParameter) => void | Promise<void>
}

export function WidoWidget(props: WidoWidgetProps) {
  return (
    <Widget {...props}>
      <Swap {...props} />
    </Widget>
  )
}
