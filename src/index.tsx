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
import { QuoteRequest, QuoteResult } from 'wido'
export type { WidoWidgetPlaceholderProps } from 'components/Swap/WidoWidgetPlaceholder'
export { WidoWidgetPlaceholder } from 'components/Swap/WidoWidgetPlaceholder'
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
  partner?: string

  // WidgetProps
  theme?: Theme
  width?: string | number
  className?: string
  /**
   * @default "Zap"
   */
  title?: string
  /**
   * Whether the widget can open the token select in a larger Modal, or to show it contained within the widget.
   *
   * @default false
   */
  largeTokenSelect?: boolean

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

  /**
   * Defaults to the quote function from the wido sdk. Can be used to override the default behavior.
   */
  quoteApi?: (request: QuoteRequest) => Promise<QuoteResult>
}

export function WidoWidget(props: WidoWidgetProps) {
  return (
    <Widget {...props}>
      <Swap {...props} />
    </Widget>
  )
}
