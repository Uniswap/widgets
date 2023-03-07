/***
 * Utilities for testing components and hooks within a Widget context.
 *
 * Provides renderComponent and renderHook utilities, which use test-specific providers to mock out
 * a functioning environment.
 */
import { render, RenderHookOptions, RenderOptions, waitForOptions } from '@testing-library/react'
import { renderHook as renderHookBase, waitFor as waitForBase } from '@testing-library/react'
import TokenList from '@uniswap/default-token-list'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Provider as DialogProvider } from 'components/Dialog'
import ErrorBoundary from 'components/Error/ErrorBoundary'
import { WidgetProps } from 'components/Widget'
import { DEFAULT_LOCALE } from 'constants/locales'
import { Provider as BlockNumberProvider } from 'hooks/useBlockNumber'
import { TestableProvider as TokenListProvider } from 'hooks/useTokenList'
import { TestableProvider as Web3Provider } from 'hooks/web3'
import { Provider as ConnectorsProvider } from 'hooks/web3/useConnectors'
import { TestableProvider as I18nProvider } from 'i18n'
import { Provider as AtomProvider } from 'jotai'
import { Atom } from 'jotai'
import { PropsWithChildren, ReactElement, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from 'state'
import { Provider as ThemeProvider } from 'theme'
import JsonRpcConnector from 'utils/JsonRpcConnector'
import { WalletConnectPopup, WalletConnectQR } from 'utils/WalletConnect'

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { default as fetch } from 'jest-fetch-mock'

export function waitFor(callback: () => unknown, options?: Omit<waitForOptions, 'timeout'>) {
  // Increase the default timeout to the default L1 block interval (as tests will fork mainnet).
  return waitForBase(callback, { ...options, timeout: 12000 })
}

interface TestableWidgetProps extends WidgetProps {
  initialAtomValues?: Iterable<readonly [Atom<unknown>, unknown]>
}

export function TestableWidget(props: PropsWithChildren<TestableWidgetProps>) {
  const [dialog, setDialog] = useState<HTMLDivElement | null>(props.dialog || null)
  return (
    <ThemeProvider>
      <I18nProvider locale={DEFAULT_LOCALE}>
        <div ref={setDialog} />
        <DialogProvider value={dialog}>
          <ErrorBoundary>
            <ReduxProvider store={store}>
              <AtomProvider initialValues={props.initialAtomValues}>
                <Web3Provider provider={hardhat.provider}>
                  <ConnectorsProvider
                    connectors={{
                      user: {} as JsonRpcConnector,
                      metaMask: {} as MetaMask,
                      walletConnect: {} as WalletConnectPopup,
                      walletConnectQR: {} as WalletConnectQR,
                      network: {} as Network,
                    }}
                  >
                    <BlockNumberProvider>
                      <TokenListProvider list={TokenList.tokens}>{props.children}</TokenListProvider>
                    </BlockNumberProvider>
                  </ConnectorsProvider>
                </Web3Provider>
              </AtomProvider>
            </ReduxProvider>
          </ErrorBoundary>
        </DialogProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

interface WidgetOptions {
  initialAtomValues?: Iterable<readonly [Atom<unknown>, unknown]>
}

function getWrapper({ initialAtomValues }: WidgetOptions = {}) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <TestableWidget initialAtomValues={initialAtomValues}>{children}</TestableWidget>
  }
}

export function renderComponent(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'> & WidgetOptions) {
  const Wrapper = getWrapper(options)
  return render(ui, { wrapper: Wrapper, ...options })
}

export function renderHook<Result, Props>(
  hook: (initialProps: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'> & WidgetOptions
) {
  const Wrapper = getWrapper(options)
  return renderHookBase(hook, { wrapper: Wrapper, ...options })
}
