import { TokenInfo } from '@uniswap/token-lists'
import { DialogWidgetProps, Provider as DialogProvider } from 'components/Dialog'
import ErrorBoundary, { OnError } from 'components/Error/ErrorBoundary'
import { SupportedLocale } from 'constants/locales'
import { TransactionEventHandlers, TransactionsUpdater } from 'hooks/transactions'
import { Provider as BlockNumberProvider } from 'hooks/useBlockNumber'
import { Flags, useInitialFlags } from 'hooks/useSyncFlags'
import useSyncWidgetEventHandlers, { WidgetEventHandlers } from 'hooks/useSyncWidgetEventHandlers'
import { Provider as TokenListProvider } from 'hooks/useTokenList'
import { Provider as Web3Provider, ProviderProps as Web3Props } from 'hooks/web3'
import { Provider as I18nProvider } from 'i18n'
import { Provider as AtomProvider } from 'jotai'
import { PropsWithChildren, StrictMode, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from 'state'
import { MulticallUpdater } from 'state/multicall'
import styled from 'styled-components/macro'
import { Provider as ThemeProvider, Theme } from 'theme'

import WidgetWrapper from './WidgetWrapper'

export const DialogWrapper = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.large}rem;
  height: 100%;
  left: 0;
  padding: 0.5rem;
  position: absolute;
  top: 0;
  width: 100%;
`

export interface WidgetProps
  extends Flags,
    TransactionEventHandlers,
    Web3Props,
    WidgetEventHandlers,
    DialogWidgetProps {
  theme?: Theme
  locale?: SupportedLocale
  tokenList?: string | TokenInfo[]
  width?: string | number
  className?: string
  onError?: OnError
}

export default function Widget(props: PropsWithChildren<WidgetProps>) {
  const [dialog, setDialog] = useState<HTMLDivElement | null>(props.dialog || null)
  return (
    <StrictMode>
      <ThemeProvider theme={props.theme}>
        <WidgetWrapper width={props.width} className={props.className}>
          <I18nProvider locale={props.locale}>
            <DialogWrapper ref={setDialog} />
            <DialogProvider value={props.dialog || dialog} options={props.dialogOptions}>
              <ErrorBoundary onError={props.onError}>
                <ReduxProvider store={store}>
                  {
                    // UI configuration must be passed to initial atom values, or the first frame will render incorrectly.
                  }
                  <AtomProvider initialValues={useInitialFlags(props as Flags)}>
                    <WidgetUpdater {...props} />
                    <Web3Provider {...(props as Web3Props)}>
                      <BlockNumberProvider>
                        <MulticallUpdater />
                        <TransactionsUpdater {...(props as TransactionEventHandlers)} />
                        <TokenListProvider list={props.tokenList}>{props.children}</TokenListProvider>
                      </BlockNumberProvider>
                    </Web3Provider>
                  </AtomProvider>
                </ReduxProvider>
              </ErrorBoundary>
            </DialogProvider>
          </I18nProvider>
        </WidgetWrapper>
      </ThemeProvider>
    </StrictMode>
  )
}

/** A component in the scope of AtomProvider to set Widget-scoped state. */
function WidgetUpdater(props: WidgetProps) {
  useSyncWidgetEventHandlers(props as WidgetEventHandlers)
  return null
}
