import { css } from 'styled-components/macro'

export const globalFontStyles = css`
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  color: ${({ theme }) => theme.primary};
  font-size: 16px;
  font-smooth: always;
  font-variant: none;

  * {
    font-family: ${({ theme }) => (typeof theme.fontFamily === 'string' ? theme.fontFamily : theme.fontFamily.font)};

    @supports (font-variation-settings: normal) {
      font-family: ${({ theme }) => (typeof theme.fontFamily === 'string' ? undefined : theme.fontFamily.variable)};
    }
  }
`
