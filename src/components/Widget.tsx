import { JsonRpcProvider } from '@ethersproject/providers'
import { TokenInfo } from '@uniswap/token-lists'
import { Provider as Eip1193Provider } from '@web3-react/types'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from 'constants/locales'
import { ActiveWeb3Provider } from 'hooks/connectWeb3/useWeb3React'
import { TransactionsUpdater } from 'hooks/transactions'
import { BlockNumberProvider } from 'hooks/useBlockNumber'
import { TokenListProvider } from 'hooks/useTokenList'
import { Provider as I18nProvider } from 'i18n'
import { Provider as AtomProvider } from 'jotai'
import { PropsWithChildren, StrictMode, useMemo, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from 'state'
import { MulticallUpdater } from 'state/multicall'
import styled, { keyframes } from 'styled-components/macro'
import { Theme, ThemeProvider } from 'theme'
import { UNMOUNTING } from 'utils/animations'

import { Modal, Provider as DialogProvider } from './Dialog'
import ErrorBoundary, { ErrorHandler } from './Error/ErrorBoundary'

const DEFAULT_CHAIN_ID = SupportedChainId.MAINNET

const WidgetWrapper = styled.div<{ width?: number | string }>`
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius}em;
  box-sizing: border-box;
  color: ${({ theme }) => theme.primary};
  display: flex;
  flex-direction: column;
  font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
  font-size: 16px;
  font-smooth: always;
  font-variant: none;
  height: 360px;
  min-width: 300px;
  padding: 0.25em;
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

const slideIn = keyframes`
  from {
    transform: translateX(calc(100% - 0.25em));
  }
`
const slideOut = keyframes`
  to {
    transform: translateX(calc(100% - 0.25em));
  }
`

const DialogWrapper = styled.div`
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
    animation: ${slideIn} 0.25s ease-in;

    &.${UNMOUNTING} {
      animation: ${slideOut} 0.25s ease-out;
    }
  }
`

export type WidgetProps = {
  theme?: Theme
  locale?: SupportedLocale
  provider?: Eip1193Provider | JsonRpcProvider
  jsonRpcUrlMap?: { [chainId: number]: string[] }
  defaultChainId?: SupportedChainId
  tokenList?: string | TokenInfo[]
  width?: string | number
  dialog?: HTMLElement | null
  className?: string
  onError?: ErrorHandler
  onTxSubmit?: (txHash: string, data: any) => void
  onTxSuccess?: (txHash: string, data: any) => void
  onTxFail?: (error: Error, data: any) => void
}

export default function Widget(props: PropsWithChildren<WidgetProps>) {
  const { children, theme, provider, dialog: userDialog, className, onError } = props
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
  const defaultChainId = useMemo(() => {
    if (!props.defaultChainId) return DEFAULT_CHAIN_ID
    if (!ALL_SUPPORTED_CHAIN_IDS.includes(props.defaultChainId)) {
      console.warn(`Unsupported chainId: ${props.defaultChainId}. Falling back to 1 (Ethereum Mainnet).`)
      return DEFAULT_CHAIN_ID
    }
    return props.defaultChainId
  }, [props.defaultChainId])
  const jsonRpcUrlMap: string | JsonRpcProvider | { [chainId: number]: string[] } = useMemo(() => {
    if (!props.jsonRpcUrlMap) return JSON_RPC_FALLBACK_ENDPOINTS
    for (const supportedChainId of ALL_SUPPORTED_CHAIN_IDS) {
      if (!Object.keys(props.jsonRpcUrlMap).includes(`${supportedChainId}`)) {
        const fallbackRpc = JSON_RPC_FALLBACK_ENDPOINTS[supportedChainId as number]
        console.warn(
          `Did not provide a jsonRpcUrlMap for chainId: ${supportedChainId}. Falling back to public RPC endpoint ${fallbackRpc}, which may be unreliable and severly rate-limited.`
        )
        props.jsonRpcUrlMap[supportedChainId as number] = fallbackRpc
      }
    }
    return props.jsonRpcUrlMap
  }, [props.jsonRpcUrlMap])

  const [dialog, setDialog] = useState<HTMLDivElement | null>(null)
  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <WidgetWrapper width={width} className={className}>
          <I18nProvider locale={locale}>
            <DialogWrapper ref={setDialog} />
            <DialogProvider value={userDialog || dialog}>
              <ErrorBoundary onError={onError}>
                <ReduxProvider store={store}>
                  <AtomProvider>
                    <ActiveWeb3Provider
                      provider={provider}
                      jsonRpcUrlMap={jsonRpcUrlMap}
                      defaultChainId={defaultChainId}
                    >
                      <BlockNumberProvider>
                        <MulticallUpdater />
                        <TransactionsUpdater
                          onTxSubmit={props.onTxSubmit}
                          onTxSuccess={props.onTxSuccess}
                          onTxFail={props.onTxFail}
                        />
                        <TokenListProvider list={props.tokenList}>{children}</TokenListProvider>
                      </BlockNumberProvider>
                    </ActiveWeb3Provider>
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
