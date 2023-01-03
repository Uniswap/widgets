import { render, renderHook as renderHookBase, RenderHookOptions, RenderOptions } from '@testing-library/react'
import { TestableWidget } from 'components/Widget'
import { JSON_RPC_FALLBACK_ENDPOINTS } from 'constants/jsonRpcEndpoints'
import { Atom } from 'jotai'
import { PropsWithChildren, ReactElement } from 'react'

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { default as fetch } from 'jest-fetch-mock'

interface WidgetOptions {
  initialAtomValues?: Iterable<readonly [Atom<unknown>, unknown]>
}

function getWrapper({ initialAtomValues }: WidgetOptions = {}) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <TestableWidget
        provider={global.hardhat?.provider}
        jsonRpcUrlMap={{ ...JSON_RPC_FALLBACK_ENDPOINTS, 1: [global.hardhat?.url] }}
        initialAtomValues={initialAtomValues}
      >
        {children}
      </TestableWidget>
    )
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
