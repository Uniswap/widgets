import { Trans } from '@lingui/macro'
import { renderComponent } from 'test'

import Header from './Header'
import Settings from './Swap/Settings'

describe('Header', () => {
  it('renders empty', () => {
    const component = renderComponent(<Header />)
    expect(component.queryByTestId('header-container')).toBeTruthy()
    expect(component.queryByTestId('header-title')).toBeNull()
    expect(component.queryByTestId('header-children')).toBeNull()
  })

  it('renders with title', () => {
    const component = renderComponent(<Header title={<Trans>Test Title</Trans>} />)
    expect(component.queryByTestId('header-container')).toBeTruthy()
    expect(component.queryByTestId('header-title')).toBeTruthy()
    expect(component.getByText('Test Title')).toBeTruthy()
    expect(component.queryByTestId('header-children')).toBeNull()
  })

  it('renders with children (actual values)', () => {
    const component = renderComponent(
      <Header title={<Trans>Swap</Trans>}>
        <Settings />
      </Header>
    )
    expect(component.queryByTestId('header-container')).toBeTruthy()
    expect(component.queryByTestId('header-title')).toBeTruthy()
    expect(component.getByText('Swap')).toBeTruthy()
    expect(component.queryByTestId('header-children')).toBeTruthy()
    expect(component.queryByTestId('settings-button')).toBeTruthy()
    expect(component).toMatchSnapshot()
  })
})
