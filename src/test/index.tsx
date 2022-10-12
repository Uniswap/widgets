import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import tokenList, { tokens } from '@uniswap/default-token-list'
import { TestableWidget, TestableWidgetProps } from 'components/Widget'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import { dynamicActivate } from 'i18n'
import fetch from 'jest-fetch-mock'
import { Atom, Provider as AtomProvider } from 'jotai'
import { createRef, MutableRefObject, PropsWithChildren, ReactElement, RefObject, useEffect } from 'react'
import { ThemeProvider } from 'theme'

export type { RenderResult } from '@testing-library/react'
export { act, render, waitFor } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { default as fetch } from 'jest-fetch-mock'

fetch.enableMocks()

beforeEach(() => {
  fetchMock.mockIf('https://gateway.ipfs.io/ipns/tokens.uniswap.org', JSON.stringify(tokenList))
})

beforeAll(async () => {
  await dynamicActivate('en-US')
})

function TestProvider({ initialAtomValues, children }: PropsWithChildren<ComponentRenderOptions>) {
  return (
    <ThemeProvider>
      <I18nProvider i18n={i18n}>
        <AtomProvider initialValues={initialAtomValues}>{children}</AtomProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export interface HookRenderOptions extends RenderOptions {
  initialAtomValues?: Iterable<readonly [Atom<unknown>, unknown]>
}

export interface HookRenderResult<T> {
  result: RefObject<T>
  rerender: (hook: () => T) => HookRenderResult<T>
}

export function renderHook<T>(hook: () => T, options?: HookRenderOptions): HookRenderResult<T> {
  const result = createRef<T>() as MutableRefObject<T>

  function TestComponent() {
    const value = hook()
    useEffect(() => {
      result.current = value
    })

    return null
  }

  const rendered = render(
    <TestProvider initialAtomValues={options?.initialAtomValues}>
      <TestComponent />
    </TestProvider>,
    options
  )

  const rerender = function (hook: () => T) {
    function TestComponent() {
      const value = hook()
      useEffect(() => {
        result.current = value
      })

      return null
    }

    rendered.rerender(
      <TestProvider>
        <TestComponent />
      </TestProvider>
    )

    return { result, rerender }
  }

  return { result, rerender }
}

export interface ComponentRenderOptions extends RenderOptions {
  initialAtomValues?: Iterable<readonly [Atom<unknown>, unknown]>
}

export function renderComponent(ui: ReactElement, options?: ComponentRenderOptions): RenderResult {
  const result = render(<TestProvider initialAtomValues={options?.initialAtomValues}>{ui}</TestProvider>, options)

  const rerender = result.rerender
  result.rerender = function (this, ui) {
    return rerender.call(this, <TestProvider>{ui}</TestProvider>)
  }

  return result
}

export interface WidgetRenderOptions extends RenderOptions, TestableWidgetProps {}

export function renderWidget(ui: ReactElement, options?: WidgetRenderOptions): RenderResult {
  const props: TestableWidgetProps = {
    provider: options?.provider ?? hardhat.provider,
    jsonRpcUrlMap: options?.jsonRpcUrlMap ?? {
      ...JSON_RPC_FALLBACK_ENDPOINTS,
      1: [hardhat.url],
    },
    defaultChainId: options?.defaultChainId ?? 1,
    tokenList: options?.tokenList ?? tokens,
    initialAtomValues: options?.initialAtomValues,
  }
  const result = render(<TestableWidget {...props}>{ui}</TestableWidget>, options)

  const rerender = result.rerender
  result.rerender = function (this, ui) {
    rerender.call(this, <TestableWidget {...props}>{ui}</TestableWidget>)
  }

  return result
}
