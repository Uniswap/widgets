import { createContext, PropsWithChildren, useContext } from 'react'
import { WIDGET_BREAKPOINTS } from 'theme/breakpoints'

const WidgetWidthContext = createContext<number>(0)

interface WidgetWidthProviderProps {
  width: number
}

export function WidgetWidthProvider({ width, children }: PropsWithChildren<WidgetWidthProviderProps>) {
  return <WidgetWidthContext.Provider value={width}>{children}</WidgetWidthContext.Provider>
}

export function useWidgetWidth(): number {
  return useContext(WidgetWidthContext)
}

export function useIsWideWidget(): boolean {
  const widgetWidth = useWidgetWidth()
  return widgetWidth > WIDGET_BREAKPOINTS.WIDE
}
