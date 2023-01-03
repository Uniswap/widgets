import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { TestableWidget } from 'components/Widget'
import { Atom, Provider as AtomProvider } from 'jotai'
import { createRef, MutableRefObject, PropsWithChildren, ReactElement, RefObject, useEffect } from 'react'
import { ThemeProvider } from 'theme'

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { default as fetch } from 'jest-fetch-mock'

function TestProvider({ initialAtomValues, children }: PropsWithChildren<ComponentRenderOptions>) {
  return (
    <ThemeProvider>
      <I18nProvider i18n={i18n}>
        <AtomProvider initialValues={initialAtomValues}>{children}</AtomProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

interface HookRenderOptions extends RenderOptions {
  initialAtomValues?: Iterable<readonly [Atom<unknown>, unknown]>
}

interface HookRenderResult<T> {
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

interface ComponentRenderOptions extends RenderOptions {
  initialAtomValues?: Iterable<readonly [Atom<unknown>, unknown]>
}

export function renderComponent(ui: ReactElement, options?: ComponentRenderOptions): RenderResult {
  return render(<TestableWidget initialAtomValues={options?.initialAtomValues}>{ui}</TestableWidget>, options)
}
