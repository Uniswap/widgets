import { globalFontStyles } from 'css/font'
import { WidgetWidthProvider } from 'hooks/useWidgetWidth'
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import styled from 'styled-components/macro'
import { WIDGET_BREAKPOINTS } from 'theme/breakpoints'
import toLength from 'utils/toLength'

const ROOT_CONTAINER_PADDING = 8

const StyledWidgetWrapper = styled.div<{ width: number | string }>`
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  background-color: ${({ theme }) => theme.container};
  border: ${({ theme }) => `1px solid ${theme.outline}`};
  border-radius: ${({ theme }) => theme.borderRadius.large}rem;
  box-shadow: ${({ theme }) => `0px 40px 120px 0px ${theme.networkDefaultShadow}`};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  max-width: 600px;
  min-height: 300px;
  min-width: 300px;
  padding: ${ROOT_CONTAINER_PADDING}px;
  position: relative;
  user-select: none;
  width: ${({ width }) => toLength(width)};

  * {
    box-sizing: border-box;
  }

  ${globalFontStyles};
`

interface WidgetWrapperProps {
  width: number | string | undefined
  className?: string | undefined
}

export default function WidgetWrapper(props: PropsWithChildren<WidgetWrapperProps>) {
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
    return props.width ?? WIDGET_BREAKPOINTS.EXTRA_SMALL
  }, [props.width])

  /**
   * We need to manually track the width of the widget because the width prop could be a string
   * like "100%" or "400px" instead of a number.
   */
  const ref = useRef<HTMLDivElement>(null)
  const [wrapperWidth, setWidgetWidth] = useState<number>(
    toLength(initialWidth) === initialWidth
      ? WIDGET_BREAKPOINTS.EXTRA_SMALL // If the initial width is a string, use default width until the ResizeObserver gives us the true width as a number.
      : (initialWidth as number)
  )
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      // contentRect doesn't include padding or borders
      const { width } = entries[0].contentRect
      setWidgetWidth(width + 2 * ROOT_CONTAINER_PADDING)
    })
    const current = ref.current
    if (current) {
      observer.observe(ref.current)
    }
    return () => {
      if (current) {
        observer.unobserve(current)
      }
    }
  }, [])

  return (
    <StyledWidgetWrapper width={initialWidth} className={props.className} ref={ref}>
      <WidgetWidthProvider width={wrapperWidth}>{props.children}</WidgetWidthProvider>
    </StyledWidgetWrapper>
  )
}
