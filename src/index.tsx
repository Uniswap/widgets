import 'polyfills'

import { TransactionReceipt, Web3Provider } from '@ethersproject/providers'
import Swap from 'components/Swap'
import Widget from 'components/Widget'
import { OnTxFail, OnTxSubmit, OnTxSuccess } from 'hooks/transactions'
import { OnError, OnSwitchChain } from 'hooks/useSyncWidgetSettings'
import { ErrorInfo } from 'react'
import { AccountInterface } from 'starknet'
import { OnConnectWalletClick } from 'state/wallet'
import { Theme } from 'theme'
// export type { Provider as EthersProvider } from '@ethersproject/abstract-provider'
// export type { JsonRpcProvider } from '@ethersproject/providers'
// export type { Currency } from '@uniswap/sdk-core'
// export { TradeType } from '@uniswap/sdk-core'
// export type { TokenInfo } from '@uniswap/token-lists'
export type { SwapWidgetSkeletonProps } from 'components/Swap/Skeleton'
export { SwapWidgetSkeleton } from 'components/Swap/Skeleton'
export type { ErrorInfo }
export type { TransactionReceipt }
export type { SupportedLocale } from 'constants/locales'
export { DEFAULT_LOCALE, SUPPORTED_LOCALES } from 'constants/locales'
// export { RouterPreference } from 'hooks/routing/types'
// export type { SwapController } from 'hooks/swap/useSyncController'
// export type { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
// export type { DefaultAddress, TokenDefaults } from 'hooks/swap/useSyncTokenDefaults'
export type {
  OnTxFail,
  OnTxSubmit,
  OnTxSuccess, // TransactionEventHandlers
} from 'hooks/transactions'
// export type { Flags } from 'hooks/useSyncFlags'
export type {
  // AddEthereumChainParameter,
  OnConnectWalletClick,
  OnError,
  OnSwitchChain, // WidgetEventHandlers,
} from 'hooks/useSyncWidgetEventHandlers'
// export { EMPTY_TOKEN_LIST } from 'hooks/useTokenList'
// export type { JsonRpcConnectionMap } from 'hooks/web3/useJsonRpcUrlsMap'
// export type {
//   OnAmountChange,
//   OnExpandSwapDetails,
//   OnInitialSwapQuote,
//   OnReviewSwapClick,
//   OnSettingsReset,
//   OnSlippageChange,
//   OnSubmitSwapClick,
//   OnSwapApprove,
//   OnSwapPriceUpdateAck,
//   OnSwitchTokens,
//   OnTokenChange,
//   OnTokenSelectorClick,
//   OnTransactionDeadlineChange,
//   SwapEventHandlers,
// } from 'state/swap'
// export { Field } from 'state/swap'
// export type { Slippage } from 'state/swap/settings'
// export type {
//   ApprovalTransactionInfo,
//   ExactInputSwapTransactionInfo,
//   ExactOutputSwapTransactionInfo,
//   SwapTransactionInfo,
//   Transaction,
//   TransactionInfo,
//   UnwrapTransactionInfo,
//   WrapTransactionInfo,
// } from 'state/transactions'
// export { TransactionType } from 'state/transactions'
export type { Theme } from 'theme'
export { darkTheme, defaultTheme, lightTheme } from 'theme'
// export { invertTradeType, toTradeType } from 'utils/tradeType'

export { isStarknetChain } from 'utils/starknet'

export type WidoWidgetProps = {
  // WidgetProps

  ethProvider?: Web3Provider
  snAccount?: AccountInterface
  srcChainIds?: number[]
  dstChainIds?: number[]
  toToken?: { chainId: number; address: string }
  fromToken?: { chainId: number; address: string }
  toProtocols?: string[]
  theme?: Theme
  width?: string | number
  className?: string

  testnetsVisible?: boolean
  partner?: string

  // TransactionEventHandlers

  onTxSubmit?: OnTxSubmit
  onTxSuccess?: OnTxSuccess
  onTxFail?: OnTxFail

  // WidgetEventHandlers

  onConnectWalletClick?: OnConnectWalletClick
  onError?: OnError
  onSwitchChain?: OnSwitchChain
}

export function WidoWidget(props: WidoWidgetProps) {
  return (
    <Widget {...props}>
      <Swap {...props} />
    </Widget>
  )
}
