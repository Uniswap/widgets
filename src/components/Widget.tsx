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

import { BridgeBanner } from './BridgeBanner'
import WidgetContainer from './WidgetContainer'
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
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  height: calc(100% - 0.5em);
  left: 0;
  margin: 0.25em;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: calc(100% - 0.5em);

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
  showL2BridgeBanner?: boolean
  dialog?: HTMLDivElement | null
  className?: string
  onError?: OnError
}

export default function Widget(props: PropsWithChildren<WidgetProps>) {
  const [dialog, setDialog] = useState<HTMLDivElement | null>(props.dialog || null)
  return (
    <StrictMode>
      <I18nProvider locale={props.locale}>
        <ErrorBoundary onError={props.onError}>
          <ReduxProvider store={store}>
            {
              // UI configuration must be passed to initial atom values, or the first frame will render incorrectly.
            }
            <AtomProvider initialValues={useInitialFlags(props as Flags)}>
              <WidgetUpdater {...props} />
              <Web3Provider {...(props as Web3Props)}>
                <BlockNumberProvider>
                  <ThemeProvider theme={props.theme}>
                    <WidgetContainer width={props.width} className={props.className}>
                      <WidgetWrapper>
                        <DialogWrapper ref={setDialog} />
                        <DialogProvider value={props.dialog || dialog}>
                          <MulticallUpdater />
                          <TransactionsUpdater {...(props as TransactionEventHandlers)} />
                          <TokenListProvider list={props.tokenList}>{props.children}</TokenListProvider>
                        </DialogProvider>
                      </WidgetWrapper>
                      {props.showL2BridgeBanner && <BridgeBanner />}
                    </WidgetContainer>
                  </ThemeProvider>
                </BlockNumberProvider>
              </Web3Provider>
            </AtomProvider>
          </ReduxProvider>
        </ErrorBoundary>
      </I18nProvider>
    </StrictMode>
  )
}

/** A component in the scope of AtomProvider to set Widget-scoped state. */
function WidgetUpdater(props: WidgetProps) {
  useSyncWidgetEventHandlers(props as WidgetEventHandlers)
  return null
}
