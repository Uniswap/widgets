import { WidgetWidthProvider } from 'hooks/useWidgetWidth'
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import styled from 'styled-components/macro'
import toLength from 'utils/toLength'

const HORIZONTAL_PADDING = 8

const StyledWidgetContainer = styled.div<{ width: number | string }>`
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  font-size: 16px;
  font-smooth: always;
  font-variant: none;
  max-width: 600px;
  min-height: 360px;
  min-width: 300px;
  position: relative;
  user-select: none;
  width: ${({ width }) => toLength(width)};

  * {
    box-sizing: border-box;
    font-family: ${({ theme }) => (typeof theme.fontFamily === 'string' ? theme.fontFamily : theme.fontFamily.font)};

    @supports (font-variation-settings: normal) {
      font-family: ${({ theme }) => (typeof theme.fontFamily === 'string' ? undefined : theme.fontFamily.variable)};
    }
  }
`

interface WidgetContainerProps {
  width: number | string | undefined
  className?: string | undefined
}

export default function WidgetContainer(props: PropsWithChildren<WidgetContainerProps>) {
  const initialWidth: string | number = useMemo(() => {
    if (props.width) {
      if (props.width < 300) {
        console.warn(`Widget width must be at least 300px (you set it to ${props.width}). Falling back to 300px.`)
        return 300
      }
      if (props.width > 600) {
        console.warn(`Widget width must be at most 600px (you set it to ${props.width}). Falling back to 600px.`)
        return 600
      }
    }
    return props.width ?? 360
  }, [props.width])

  /**
   * We need to manually track the width of the widget because the width prop could be a string
   * like "100%" or "400px" instead of a number.
   */
  const ref = useRef<HTMLDivElement>(null)
  const [containerWidth, setWidgetWidth] = useState<number>(
    toLength(initialWidth) === initialWidth
      ? 360 // If the initial width is a string, use default width until the ResizeObserver gives us the true width as a number.
      : (initialWidth as number)
  )
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      // contentRect doesn't include padding or borders
      const { width } = entries[0].contentRect
      setWidgetWidth(width + 2 * HORIZONTAL_PADDING)
    })
    const current = ref.current
    if (current) {
      observer.observe(ref.current)
    }
    return () => {
      current && observer.unobserve(current)
    }
  }, [])

  return (
    <StyledWidgetContainer width={initialWidth} className={props.className} ref={ref}>
      <WidgetWidthProvider width={containerWidth}>{props.children}</WidgetWidthProvider>
    </StyledWidgetContainer>
  )
}
