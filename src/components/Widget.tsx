import { TokenInfo } from '@uniswap/token-lists'
import { Animation, Modal, Provider as DialogProvider } from 'components/Dialog'
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
import styled, { keyframes } from 'styled-components/macro'
import { Provider as ThemeProvider, Theme } from 'theme'

import WidgetWrapper from './WidgetWrapper'

const slideInLeft = keyframes`
  from {
    transform: translateX(calc(100% - 0.25em));
  }
`
const slideOutLeft = keyframes`
  to {
    transform: translateX(calc(0.25em - 100%));
  }
`
const slideOutRight = keyframes`
  to {
    transform: translateX(calc(100% - 0.25em));
  }
`

export const DialogWrapper = styled.div`
  border: ${({ theme }) => `1px solid ${theme.outline}`};

  border-radius: ${({ theme }) => theme.borderRadius}em;
  height: 100%;
  left: 0;
  overflow: hidden;
  padding: 0.5em;
  position: absolute;
  top: 0;
  width: 100%;

  @supports (overflow: clip) {
    overflow: clip;
  }

  ${Modal} {
    animation: ${slideInLeft} 0.25s ease-in;

    &.${Animation.PAGING} {
      animation: ${slideOutLeft} 0.25s ease-in;
    }
    &.${Animation.CLOSING} {
      animation: ${slideOutRight} 0.25s ease-out;
    }
  }
`

export interface WidgetProps extends Flags, TransactionEventHandlers, Web3Props, WidgetEventHandlers {
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
