import { SlideAnimationType } from 'components/Dialog'
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
