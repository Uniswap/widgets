import { useIsWideWidget, useWidgetWidth } from 'hooks/useWidgetWidth'
import { renderComponent } from 'test'

import WidgetWrapper from './WidgetWrapper'

const widgetWidthValueTestId = 'widgetWidthValue'
const widgetWidthTypeTestId = 'widgetWidthType'
const widgetIsWideTestId = 'widgetIsWide'

function TestComponent() {
  const widgetWidth = useWidgetWidth()
  const isWide = useIsWideWidget()
  return (
    <div>
      <div data-testid={widgetWidthValueTestId}>{widgetWidth}</div>
      <div data-testid={widgetIsWideTestId}>{isWide ? 'wide' : 'narrow'}</div>
      <div data-testid={widgetWidthTypeTestId}>{typeof widgetWidth}</div>
    </div>
  )
}

describe('WidgetWrapper', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockReturnValue(undefined))

  it('should handle valid number width, narrow', () => {
    const component = renderComponent(
      <WidgetWrapper width={300}>
        <TestComponent />
      </WidgetWrapper>
    )
    // 300 is the lowest width allowed
    expect(component.getByTestId(widgetWidthValueTestId).textContent).toBe('300')
    expect(component.getByTestId(widgetWidthTypeTestId).textContent).toBe('number')
    expect(component.getByTestId(widgetIsWideTestId).textContent).toBe('narrow')
  })

  it('should handle valid number width, wide', () => {
    const component = renderComponent(
      <WidgetWrapper width={500}>
        <TestComponent />
      </WidgetWrapper>
    )
    // 300 is the lowest width allowed
    expect(component.getByTestId(widgetWidthValueTestId).textContent).toBe('500')
    expect(component.getByTestId(widgetWidthTypeTestId).textContent).toBe('number')
    expect(component.getByTestId(widgetIsWideTestId).textContent).toBe('wide')
  })

  it('should constrain to max width', () => {
    const component = renderComponent(
      <WidgetWrapper width={700}>
        <TestComponent />
      </WidgetWrapper>
    )
    // 600 is the largest width allowed
    expect(console.warn).toHaveBeenCalled()
    expect(component.getByTestId(widgetWidthValueTestId).textContent).toBe('600')
    expect(component.getByTestId(widgetWidthTypeTestId).textContent).toBe('number')
    expect(component.getByTestId(widgetIsWideTestId).textContent).toBe('wide')
  })

  it('should handle invalid number width', () => {
    const component = renderComponent(
      <WidgetWrapper width={200}>
        <TestComponent />
      </WidgetWrapper>
    )
    // 300 is the lowest width allowed
    expect(console.warn).toHaveBeenCalled()
    expect(component.getByTestId(widgetWidthValueTestId).textContent).toBe('300')
    expect(component.getByTestId(widgetWidthTypeTestId).textContent).toBe('number')
    expect(component.getByTestId(widgetIsWideTestId).textContent).toBe('narrow')
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
    expect(component.getByTestId(widgetIsWideTestId).textContent).toBe('narrow')
  })
})
