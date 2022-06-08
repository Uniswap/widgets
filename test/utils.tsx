import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render as baseRender, RenderOptions, RenderResult } from '@testing-library/react'
import { dynamicActivate } from 'i18n'
import fetch from 'jest-fetch-mock'
import { Provider as AtomProvider } from 'jotai'
import { PropsWithChildren, ReactElement } from 'react'
import { ThemeProvider } from 'theme'

export type { RenderResult } from '@testing-library/react'
export { act } from '@testing-library/react'
export { default as user } from '@testing-library/user-event'
export { default as fetch } from 'jest-fetch-mock'

fetch.enableMocks()

beforeAll(async () => {
  await dynamicActivate('en-US')
})

function TestProvider({ children }: PropsWithChildren<unknown>) {
  return (
    <ThemeProvider>
      <I18nProvider i18n={i18n}>
        <AtomProvider>{children}</AtomProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export function render(ui: ReactElement, options?: RenderOptions): RenderResult {
  const result = baseRender(<TestProvider>{ui}</TestProvider>, options)

  const rerender = result.rerender
  result.rerender = function (this, ui) {
    return rerender.call(this, <TestProvider>{ui}</TestProvider>)
  }

  return result
}
