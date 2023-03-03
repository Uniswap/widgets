import { useMemo } from 'react'
import { css } from 'styled-components/macro'

const overflowCss = css`
  overflow-y: scroll;
`

const hiddenScrollbarCss = css`
  overflow-y: auto;
`

/** Customizes the scrollbar for vertical overflow. */
const scrollbarCss = (padded: boolean) => css`
  overflow-y: scroll;

  ::-webkit-scrollbar {
    width: 1.25rem;
  }

  ::-webkit-scrollbar-thumb {
    background: radial-gradient(
        closest-corner at 0.25rem 0.25rem,
        ${({ theme }) => theme.interactive} 0.25rem,
        transparent 0.25rem
      ),
      linear-gradient(
        to bottom,
        #ffffff00 0.25em,
        ${({ theme }) => theme.interactive} 0.25rem,
        ${({ theme }) => theme.interactive} calc(100% - 0.25rem),
        #ffffff00 calc(100% - 0.25rem)
      ),
      radial-gradient(
        closest-corner at 0.25em calc(100% - 0.25rem),
        ${({ theme }) => theme.interactive} 0.25rem,
        #ffffff00 0.25rem
      );
    background-clip: padding-box;
    border: none;
    ${padded ? 'border-right' : 'border-left'}: 0.75rem solid transparent;
  }

  @supports not selector(::-webkit-scrollbar-thumb) {
    scrollbar-color: ${({ theme }) => theme.interactive} transparent;
  }
`

interface ScrollbarOptions {
  padded?: boolean
  hideScrollbar?: boolean
}

export default function useScrollbar(
  element: HTMLElement | null,
  { padded = false, hideScrollbar = false }: ScrollbarOptions = {}
) {
  return useMemo(
    // NB: The css must be applied on an element's first render. WebKit will not re-apply overflow
    // properties until any transitions have ended, so waiting a frame for state would cause jank.
    () => {
      if (hideScrollbar) return hiddenScrollbarCss
      return hasOverflow(element) ? scrollbarCss(padded) : overflowCss
    },
    [element, padded, hideScrollbar]
  )

  function hasOverflow(element: HTMLElement | null) {
    if (!element) return true
    return element.scrollHeight > element.clientHeight
  }
}
