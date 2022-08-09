import { render, RenderOptions } from '@testing-library/react'
import { tokens } from '@uniswap/default-token-list'
import { Atom, Provider as AtomProvider } from 'jotai'
import React, { ReactElement, StrictMode, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'

import { SUPPORTED_LOCALES, SwapWidgetProps } from '../src'
import { Provider as DialogProvider } from '../src/components/Dialog'
import { DialogWrapper } from '../src/components/Widget'
import { ActiveWeb3Provider } from '../src/hooks/connectWeb3/useWeb3React'
import { TransactionsUpdater } from '../src/hooks/transactions'
import { BlockNumberProvider } from '../src/hooks/useBlockNumber'
import { TokenListProvider } from '../src/hooks/useTokenList'
import { Provider as I18nProvider } from '../src/i18n'
import { store } from '../src/state'
import { MulticallUpdater } from '../src/state/multicall'
import { lightTheme, ThemeProvider } from '../src/theme'

type TestSwapWidgetProviders = SwapWidgetProps & {
  atomProviderInitialValues: Iterable<readonly [Atom<unknown>, unknown]> | undefined
}

let atomProviderInitialValues: any

const SwapWidgetProviders = (props: TestSwapWidgetProviders) => {
  const [dialog, setDialog] = useState<HTMLDivElement | null>(null)
  const provider = React.useMemo(() => props.provider || hardhat.provider, [props])
  const jsonRpcUrlMap = React.useMemo(() => props.jsonRpcUrlMap || { 1: [hardhat.url] }, [props])
  const defaultChainId = React.useMemo(() => props.defaultChainId || 1, [props])
  return (
    <StrictMode>
      <ThemeProvider theme={lightTheme}>
        <I18nProvider locale={SUPPORTED_LOCALES[0]}>
          <DialogWrapper ref={setDialog} />
          <DialogProvider value={props.dialog || dialog}>
            <ReduxProvider store={store}>
              <AtomProvider initialValues={atomProviderInitialValues}>
                <ActiveWeb3Provider provider={provider} jsonRpcUrlMap={jsonRpcUrlMap} defaultChainId={defaultChainId}>
                  <BlockNumberProvider>
                    <MulticallUpdater />
                    <TransactionsUpdater
                      onTxSubmit={props.onTxSubmit}
                      onTxSuccess={props.onTxSuccess}
                      onTxFail={props.onTxFail}
                    />
                    <TokenListProvider list={tokens}>{props.children}</TokenListProvider>
                  </BlockNumberProvider>
                </ActiveWeb3Provider>
              </AtomProvider>
            </ReduxProvider>
          </DialogProvider>
        </I18nProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

type CustomOptions = Omit<RenderOptions, 'wrapper'> & {
  atomProviderInitialValues: any
}

const customRender = (ui: ReactElement, options?: CustomOptions) => {
  if (options?.atomProviderInitialValues) {
    atomProviderInitialValues = options.atomProviderInitialValues
  }
  return render(ui, { wrapper: SwapWidgetProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
