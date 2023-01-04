import { createContext, PropsWithChildren, useContext } from 'react'

const WidgetWidthContext = createContext<number>(0)

interface WidgetWidthProviderProps {
  width: number
}

export function WidgetWidthProvider(props: PropsWithChildren<WidgetWidthProviderProps>) {
  return <WidgetWidthContext.Provider value={props.width}>{props.children}</WidgetWidthContext.Provider>
}

export function useWidgetWidth(): number {
  return useContext(WidgetWidthContext)
}

export function useIsWideWidget(): boolean {
  const widgetWidth = useContext(WidgetWidthContext)
  return widgetWidth > 420
}
