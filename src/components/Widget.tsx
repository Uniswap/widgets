import { TokenInfo } from '@uniswap/token-lists'
import { Animation, Modal, Provider as DialogProvider } from 'components/Dialog'
import ErrorBoundary, { OnError } from 'components/Error/ErrorBoundary'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from 'constants/locales'
import { TransactionEventHandlers, TransactionsUpdater } from 'hooks/transactions'
import { BlockNumberProvider } from 'hooks/useBlockNumber'
import useInitialAtomValues from 'hooks/useInitialAtomValues'
import useSyncBrandingSetting, { BrandingSettings } from 'hooks/useSyncBrandingSetting'
import useSyncWidgetEventHandlers, { WidgetEventHandlers } from 'hooks/useSyncWidgetEventHandlers'
import { TokenListProvider } from 'hooks/useTokenList'
import { Provider as Web3Provider, ProviderProps as Web3Props } from 'hooks/web3'
import { Provider as I18nProvider } from 'i18n'
import { Atom, Provider as AtomProvider } from 'jotai'
import { PropsWithChildren, StrictMode, useMemo, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from 'state'
import { MulticallUpdater } from 'state/multicall'
import styled, { keyframes } from 'styled-components/macro'
import { Theme, ThemeProvider } from 'theme'

export const WidgetWrapper = styled.div<{ width?: number | string }>`
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius}em;
  box-sizing: border-box;
  color: ${({ theme }) => theme.primary};
  display: flex;
  flex-direction: column;
  font-size: 16px;
  font-smooth: always;
  font-variant: none;
  min-height: 360px;
  min-width: 300px;
  padding: 8px;
  position: relative;
  user-select: none;
  width: ${({ width }) => width && (isNaN(Number(width)) ? width : `${width}px`)};

  * {
    box-sizing: border-box;
    font-family: ${({ theme }) => (typeof theme.fontFamily === 'string' ? theme.fontFamily : theme.fontFamily.font)};

    @supports (font-variation-settings: normal) {
      font-family: ${({ theme }) => (typeof theme.fontFamily === 'string' ? undefined : theme.fontFamily.variable)};
    }
  }
`

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

export interface WidgetProps extends BrandingSettings, TransactionEventHandlers, Web3Props, WidgetEventHandlers {
  theme?: Theme
  locale?: SupportedLocale
  tokenList?: string | TokenInfo[]
  width?: string | number
  dialog?: HTMLDivElement | null
  className?: string
  onError?: OnError
}

export default function Widget(props: PropsWithChildren<WidgetProps>) {
  return <TestableWidget {...props} initialAtomValues={undefined} />
}

export interface TestableWidgetProps extends WidgetProps {
  initialAtomValues?: Iterable<readonly [Atom<unknown>, unknown]>
}

export function TestableWidget(props: PropsWithChildren<TestableWidgetProps>) {
  if (props.initialAtomValues && process.env.NODE_ENV !== 'test') {
    throw new Error('initialAtomValues may only be used for testing')
  }

  // UI configuration must be passed for the initial render, or the first frame will render incorrectly.
  const initialAtomValues = useInitialAtomValues(props)

  const width = useMemo(() => {
    if (props.width && props.width < 300) {
      console.warn(`Widget width must be at least 300px (you set it to ${props.width}). Falling back to 300px.`)
      return 300
    }
    return props.width ?? 360
  }, [props.width])
  const locale = useMemo(() => {
    if (props.locale && ![...SUPPORTED_LOCALES, 'pseudo'].includes(props.locale)) {
      console.warn(`Unsupported locale: ${props.locale}. Falling back to ${DEFAULT_LOCALE}.`)
      return DEFAULT_LOCALE
    }
    return props.locale ?? DEFAULT_LOCALE
  }, [props.locale])
  const [dialog, setDialog] = useState<HTMLDivElement | null>(props.dialog || null)
  return (
    <StrictMode>
      <ThemeProvider theme={props.theme}>
        <WidgetWrapper width={width} className={props.className}>
          <I18nProvider locale={locale}>
            <DialogWrapper ref={setDialog} />
            <DialogProvider value={props.dialog || dialog}>
              <ErrorBoundary onError={props.onError}>
                <ReduxProvider store={store}>
                  <AtomProvider initialValues={props.initialAtomValues || initialAtomValues}>
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
  useSyncBrandingSetting(props as BrandingSettings)
  useSyncWidgetEventHandlers(props as WidgetEventHandlers)
  return null
}
