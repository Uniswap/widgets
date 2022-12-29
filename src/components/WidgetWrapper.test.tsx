import useWidgetWidth from 'hooks/useWidgetWidth'
import { renderComponent } from 'test'

import WidgetWrapper from './WidgetWrapper'

const widgetWidthValueTestId = 'widgetWidthValue'
const widgetWidthTypeTestId = 'widgetWidthType'

function TestComponent() {
  const widgetWidth = useWidgetWidth()
  return (
    <div>
      <div data-testid={widgetWidthValueTestId}>{widgetWidth}</div>
      <div data-testid={widgetWidthTypeTestId}>{typeof widgetWidth}</div>
    </div>
  )
}

describe('WidgetWrapper', () => {
  it('should handle valid number width', () => {
    const component = renderComponent(
      <WidgetWrapper width={300}>
        <TestComponent />
      </WidgetWrapper>
    )
    // 300 is the lowest width allowed
    expect(component.getByTestId(widgetWidthValueTestId).textContent).toBe('300')
    expect(component.getByTestId(widgetWidthTypeTestId).textContent).toBe('number')
  })

  it('should handle invalid number width', () => {
    const component = renderComponent(
      <WidgetWrapper width={200}>
        <TestComponent />
      </WidgetWrapper>
    )
    // 300 is the lowest width allowed
    expect(component.getByTestId(widgetWidthValueTestId).textContent).toBe('300')
    expect(component.getByTestId(widgetWidthTypeTestId).textContent).toBe('number')
  })

  it('should handle undefined width', () => {
    const component = renderComponent(
      <WidgetWrapper width={undefined}>
        <TestComponent />
      </WidgetWrapper>
    )

    // We default to 360px if width is undefined
    expect(component.getByTestId(widgetWidthValueTestId).textContent).toBe('360')
    expect(component.getByTestId(widgetWidthTypeTestId).textContent).toBe('number')
  })

  // todo: write a test that verifies widgetWidth is correct when the width prop is a string
  // e.g. <WidgetWrapper width="100%"> or <WidgetWrapper width="100px">
  // This logic depends on ResizeObserver and Layout, so it must be an e2e test.
})

export {}
