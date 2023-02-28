import { css, keyframes } from 'styled-components/macro'

export enum TransitionDuration {
  Fast = 125,
  Medium = 200,
  Slow = 250,
}

export const AnimationSpeed = {
  Fast: `${TransitionDuration.Fast}ms`,
  Medium: `${TransitionDuration.Medium}ms`,
  Slow: `${TransitionDuration.Slow}ms`,
}

export enum SlideAnimationType {
  /** Used when the Dialog is closing. */
  CLOSING = 'closing',
  /**
   * Used when the Dialog is paging to another Dialog screen.
   * Paging occurs when multiple screens are sequenced in the Dialog, so that an action that closes
   * one will simultaneously open the next. Special-casing paging animations can make the user feel
   * like they are not leaving the Dialog, despite the initial screen closing.
   */
  PAGING = 'paging',
}

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export const fadeOut = keyframes`
  to {
    opacity: 0;
  }
  from {
    opacity: 1;
  }
`

export const fadeAnimationCss = css`
  animation: ${fadeIn} ${AnimationSpeed.Medium} ease-in-out;
  &.${SlideAnimationType.CLOSING} {
    animation: ${fadeOut} ${AnimationSpeed.Medium} ease-in-out;
  }
`
