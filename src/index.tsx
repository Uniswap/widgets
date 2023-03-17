import 'polyfills'

import Swap, { SwapProps } from 'components/Swap'
import Widget, { WidgetProps } from 'components/Widget'

export { getAssetsRepoURI, getNativeLogoURI, Logo, LogoUpdater, useLogo, useLogos } from './components/Logo'
export type { Provider as EthersProvider } from '@ethersproject/abstract-provider'
export type { JsonRpcProvider } from '@ethersproject/providers'
export type { Currency } from '@uniswap/sdk-core'
export { TradeType } from '@uniswap/sdk-core'
export type { TokenInfo } from '@uniswap/token-lists'
export type { Provider as Eip1193Provider } from '@web3-react/types'
export type { DialogOptions, DialogWidgetProps } from 'components/Dialog'
export { DialogAnimationType } from 'components/Dialog'
export type { SwapWidgetSkeletonProps } from 'components/Swap/Skeleton'
export { SwapWidgetSkeleton } from 'components/Swap/Skeleton'
export { SupportedChainId } from 'constants/chains'
export type { SupportedLocale } from 'constants/locales'
export { DEFAULT_LOCALE, SUPPORTED_LOCALES } from 'constants/locales'
export type { WidgetPromise } from 'errors'
export { UnknownError, UserRejectedRequestError, WidgetError } from 'errors'
export { RouterPreference } from 'hooks/routing/types'
export type { SwapController } from 'hooks/swap/useSyncController'
export type { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
export type { DefaultAddress, TokenDefaults } from 'hooks/swap/useSyncTokenDefaults'
export type { OnTxFail, OnTxSubmit, OnTxSuccess, TransactionEventHandlers } from 'hooks/transactions'
export type { Flags } from 'hooks/useSyncFlags'
export type {
  AddEthereumChainParameter,
  OnConnectWalletClick,
  OnError,
  OnSwitchChain,
  WidgetEventHandlers,
} from 'hooks/useSyncWidgetEventHandlers'
export { EMPTY_TOKEN_LIST, UNISWAP_TOKEN_LIST } from 'hooks/useTokenList'
export { validateTokenList, validateTokens } from 'hooks/useTokenList/validateTokenList'
export type { JsonRpcConnectionMap } from 'hooks/web3/useJsonRpcUrlsMap'
export type {
  OnAmountChange,
  OnExpandSwapDetails,
  OnInitialSwapQuote,
  OnPermit2Allowance,
  OnReviewSwapClick,
  OnRouterPreferenceChange,
  OnSettingsReset,
  OnSlippageChange,
  OnSubmitSwapClick,
  OnSwapApprove,
  OnSwapPriceUpdateAck,
  OnSwapQuote,
  OnSwapSend,
  OnSwitchTokens,
  OnTokenAllowance,
  OnTokenChange,
  OnTokenSelectorClick,
  OnTransactionDeadlineChange,
  OnWrapSend,
  SwapEventHandlers,
  SwapPerfEventHandlers,
  SwapSettingsEventHandlers,
} from 'state/swap'
export { Field } from 'state/swap'
export type { Slippage } from 'state/swap/settings'
export type {
  ApprovalTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  SwapTransactionInfo,
  Transaction,
  TransactionInfo,
  UnwrapTransactionInfo,
  WrapTransactionInfo,
} from 'state/transactions'
export { TransactionType } from 'state/transactions'
export type { Theme } from 'theme'
export { darkTheme, defaultTheme, lightTheme } from 'theme'
export { invertTradeType, toTradeType } from 'utils/tradeType'

export type SwapWidgetProps = SwapProps & WidgetProps

export function SwapWidget(props: SwapWidgetProps) {
  return (
    <Widget {...props}>
      <Swap {...props} />
    </Widget>
  )
}
