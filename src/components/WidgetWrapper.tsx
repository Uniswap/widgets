import { createContext, PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components/macro'

const HORIZONTAL_PADDING = 8

const StyledWidgetWrapper = styled.div<{ width?: number | string }>`
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => theme.borderRadius}em;
  box-sizing: border-box;
  color: ${({ theme }) => theme.primary};
  display: flex;
  flex-direction: column;
  font-size: 16px;
  font-smooth: always;
  font-variant: none;
  min-height: 360px;
  min-width: 300px;
  padding: ${HORIZONTAL_PADDING}px;
  position: relative;
  user-select: none;
  width: ${({ width }) => width && (isNaN(Number(width)) ? width : `${width}px`)};

  * {
    box-sizing: border-box;
    font-family: ${({ theme }) => (typeof theme.fontFamily === 'string' ? theme.fontFamily : theme.fontFamily.font)};

    @supports (font-variation-settings: normal) {
      font-family: ${({ theme }) => (typeof theme.fontFamily === 'string' ? undefined : theme.fontFamily.variable)};
    }
  }
`

type WidgetWidthContextType = {
  widgetWidth: number
}

export const WidgetWidthContext = createContext<WidgetWidthContextType>({
  widgetWidth: 0,
})

interface WidgetWrapperProps {
  width: number | string | undefined
  className?: string | undefined
}

export default function WidgetWrapper(props: PropsWithChildren<WidgetWrapperProps>) {
  const width = useMemo(() => {
    if (props.width && props.width < 300) {
      console.warn(`Widget width must be at least 300px (you set it to ${props.width}). Falling back to 300px.`)
      return 300
    }
    return props.width ?? 360
  }, [props.width])

  /**
   * We need to manually track the width of the widget because the width prop could be a string
   * like "100%" or "400px" instead of a number.
   */
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [wrapperWidth, setWidgetWidth] = useState(isNaN(Number(width)) ? 360 : (width as number))
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      // contentRect doesn't include padding or borders
      const { width } = entries[0].contentRect
      setWidgetWidth(Math.round(width) + 2 * HORIZONTAL_PADDING)
    })
    const current = wrapperRef.current
    if (current) {
      observer.observe(wrapperRef.current)
    }
    return () => {
      if (current) {
        observer.unobserve(current)
      }
    }
  }, [])

  return (
    <WidgetWidthContext.Provider value={{ widgetWidth: wrapperWidth }}>
      <StyledWidgetWrapper width={width} className={props.className} ref={wrapperRef}>
        {props.children}
      </StyledWidgetWrapper>
    </WidgetWidthContext.Provider>
  )
}
