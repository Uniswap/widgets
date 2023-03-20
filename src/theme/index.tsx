import 'assets/fonts.scss'
import './external'

import { mix, rgba, transparentize } from 'polished'
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react'
import { DefaultTheme, ThemeProvider as StyledProvider } from 'styled-components/macro'

import { Layer } from './layer'
import type { Colors, Theme, ThemeBorderRadius } from './theme'

export * from './animations'
export * from './dynamic'
export * from './layer'
export type { Color, Colors, Theme } from './theme'
export * as ThemedText from './type'

const white = 'hsl(0, 0%, 100%)'
const black = 'hsl(0, 0%, 0%)'

const brandLight = 'hsl(328, 97%, 53%)'
const brandDark = 'hsl(221, 96%, 64%)'
export const brand = brandLight

const stateColors = {
  active: 'hsl(221, 96%, 64%)',
  activeSoft: 'hsla(221, 96%, 64%, 0.24)',
  success: 'hsl(145, 63.4%, 41.8%)',
  warningSoft: 'hsla(44, 86%, 51%, 0.24)',
  critical: '#FA2B39',
  criticalSoft: 'rgba(250, 43, 57, 0.12);',
}

export const lightTheme: Colors = {
  // surface
  accent: brandLight,
  accentSoft: rgba(brandLight, 0.24),
  container: 'hsl(0, 0%, 100%)',
  module: 'hsl(231, 54%, 97%)',
  interactive: 'hsl(227, 70%, 95%)',
  outline: 'hsla(225, 18%, 44%, 0.24)',
  dialog: white,
  scrim: 'hsla(224, 37%, 8%, 0.6)',

  // text
  onAccent: white,
  primary: 'hsl(224, 37%, 8%)',
  secondary: 'hsl(227, 18%, 55%)',
  hint: 'hsl(226, 24%, 67%)',
  onInteractive: black,

  deepShadow: 'hsla(234, 17%, 24%, 0.04), hsla(234, 17%, 24%, 0.02), hsla(234, 17%, 24%, 0.04)',
  networkDefaultShadow: 'hsla(328, 97%, 53%, 0.12)',

  // state
  ...stateColors,
  warning: 'hsla(41, 100%, 35%, 1)',
  error: 'hsla(356, 95%, 57%, 1)',

  currentColor: 'currentColor',
}

export const darkTheme: Colors = {
  // surface
  accent: brandDark,
  accentSoft: rgba(brandDark, 0.24),
  container: 'hsla(224, 37%, 8%, 1)',
  module: 'hsl(222, 37%, 12%)',
  interactive: 'hsla(223, 28%, 22%, 1)',
  outline: 'hsl(224, 33%, 16%)',
  dialog: black,
  scrim: 'hsla(224, 33%, 16%, 0.5)',

  // text
  onAccent: white,
  primary: white,
  secondary: 'hsl(227, 21%, 67%)',
  hint: 'hsla(225, 18%, 44%)',
  onInteractive: white,

  deepShadow: 'hsla(0, 0%, 0%, 0.32), hsla(0, 0%, 0%, 0.24), hsla(0, 0%, 0%, 0.24)',
  networkDefaultShadow: 'hsla(221, 96%, 64%, 0.16)',

  // state
  ...stateColors,
  warning: 'hsl(44, 86%, 51%)',
  error: 'hsla(5, 97%, 71%, 1)',

  currentColor: 'currentColor',
}

/**
 * Common border radius values in em
 */
const defaultBorderRadius = {
  large: 1.5,
  medium: 1,
  small: 0.75,
  xsmall: 0.5,
}

export const defaultTheme = {
  borderRadius: defaultBorderRadius,
  zIndex: {
    modal: Layer.DIALOG,
  },
  fontFamily: {
    font: '"Inter", sans-serif',
    variable: '"InterVariable", sans-serif',
  },
  fontFamilyCode: 'IBM Plex Mono',
  tokenColorExtraction: false,
  ...lightTheme,
}

export function useSystemTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
  const [systemTheme, setSystemTheme] = useState(prefersDark.matches ? darkTheme : lightTheme)
  prefersDark.addEventListener('change', (e) => {
    setSystemTheme(e.matches ? darkTheme : lightTheme)
  })
  return systemTheme
}

const ThemeContext = createContext<DefaultTheme>(toDefaultTheme(defaultTheme))

export interface ThemeProps {
  theme?: Theme
}

export function Provider({ theme, children }: PropsWithChildren<ThemeProps>) {
  const contextTheme = useContext(ThemeContext)
  const value = useMemo(() => {
    return toDefaultTheme({
      ...contextTheme,
      ...theme,
    } as Required<Theme>)
  }, [contextTheme, theme])
  return (
    <ThemeContext.Provider value={value}>
      <StyledProvider theme={value}>{children}</StyledProvider>
    </ThemeContext.Provider>
  )
}

function toDefaultTheme(theme: Required<Theme>): DefaultTheme {
  return {
    ...theme,
    borderRadius: clamp(theme.borderRadius ? (theme.borderRadius as ThemeBorderRadius) : defaultBorderRadius),
    onHover: (color: string) =>
      color === theme.primary ? transparentize(0.4, theme.primary) : mix(0.06, theme.primary, color),
  }

  function clamp(value: ThemeBorderRadius): ThemeBorderRadius {
    const clampNum = (num: number) => Math.min(Math.max(num, 0), 1)
    return {
      large: clampNum(value.large),
      medium: clampNum(value.medium),
      small: clampNum(value.small),
      xsmall: clampNum(value.xsmall),
    }
  }
}
