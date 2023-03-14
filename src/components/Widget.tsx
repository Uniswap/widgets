import { TokenInfo } from '@uniswap/token-lists'
import { Provider as DialogProvider } from 'components/Dialog'
import ErrorBoundary, { OnError } from 'components/Error/ErrorBoundary'
import { SupportedLocale } from 'constants/locales'
import { TransactionEventHandlers, TransactionsUpdater } from 'hooks/transactions'
import { Provider as BlockNumberProvider } from 'hooks/useBlockNumber'
import { TokenBalancesProvider } from 'hooks/useCurrencyBalance'
import { Flags, useInitialFlags } from 'hooks/useSyncFlags'
import useSyncWidgetEventHandlers, { WidgetEventHandlers } from 'hooks/useSyncWidgetEventHandlers'
import useSyncWidgetSettings, { WidgetSettings } from 'hooks/useSyncWidgetSettings'
import { Provider as TokenListProvider } from 'hooks/useTokenList'
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
  border: ${({ theme }) => `1px solid ${theme.outline}`};
  border-radius: ${({ theme }) => theme.borderRadius.large}em;
  height: 100%;
  left: 0;
  padding: 0.5em;
  position: absolute;
  top: 0;
  width: 100%;
`

export interface WidgetProps extends Flags, TransactionEventHandlers, WidgetEventHandlers {
  theme?: Theme
  locale?: SupportedLocale
  tokenList?: string | TokenInfo[]
  width?: string | number
  dialog?: HTMLDivElement | null
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
            <DialogProvider value={props.dialog || dialog}>
              <ErrorBoundary onError={props.onError}>
                <ReduxProvider store={store}>
                  {
                    // UI configuration must be passed to initial atom values, or the first frame will render incorrectly.
                  }
                  <AtomProvider initialValues={useInitialFlags(props as Flags)}>
                    <WidgetUpdater {...props} />
                    <BlockNumberProvider>
                      <TokenBalancesProvider>
                        <MulticallUpdater />
                        <TransactionsUpdater {...(props as TransactionEventHandlers)} />
                        <TokenListProvider list={props.tokenList}>{props.children}</TokenListProvider>
                      </TokenBalancesProvider>
                    </BlockNumberProvider>
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
  useSyncWidgetSettings(props as WidgetSettings)
  return null
}
