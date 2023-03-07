import { css } from 'styled-components/macro'
import { AnimationSpeed } from 'theme'

export const loadingOpacity = 0.6

export const loadingCss = css`
  filter: grayscale(1);
  opacity: ${loadingOpacity};
`

// need to use isLoading as `loading` is a reserved prop
export const loadingTransitionCss = css<{ isLoading: boolean }>`
  opacity: ${({ isLoading }) => isLoading && loadingOpacity};
  transition: color ${AnimationSpeed.Fast} linear,
    opacity ${({ isLoading }) => (isLoading ? '0s' : AnimationSpeed.Medium)} ease-in-out;
`
