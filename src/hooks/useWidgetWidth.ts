import { WidgetWidthContext } from 'components/WidgetWrapper'
import { useContext } from 'react'

/**
 * Gets the current width of the widget.
 */
export default function useWidgetWidth(): number {
  const { widgetWidth } = useContext(WidgetWidthContext)
  return widgetWidth
}
