import 'assets/fonts.scss'
import './external'

import { mix, transparentize } from 'polished'
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react'
import { DefaultTheme, ThemeProvider as StyledProvider } from 'styled-components/macro'

import type { Colors, Theme } from './theme'

export * from './dynamic'
export * from './layer'
export type { Color, Colors, Theme } from './theme'
export * as ThemedText from './type'

const white = 'hsl(0, 0%, 100%)'
const black = 'hsl(0, 0%, 0%)'

const brandLight = 'hsl(331.3, 100%, 50%)'
const brandDark = 'hsl(221, 96%, 64%)'
export const brand = brandLight

const stateColors = {
  active: 'hsl(221, 96%, 64%)',
  success: 'hsl(145, 63.4%, 41.8%)',
  warning: 'hsl(43, 89.9%, 53.5%)',
  error: 'hsl(0, 98%, 62.2%)',
}

export const lightTheme: Colors = {
  // surface
  accent: brandLight,
  container: 'hsl(220, 23%, 97.5%)',
  module: 'hsl(231, 14%, 90%)',
  interactive: 'hsl(229, 13%, 83%)',
  outline: 'hsl(225, 7%, 78%)',
  dialog: white,

  // text
  onAccent: white,
  primary: black,
  secondary: 'hsl(227, 10%, 37.5%)',
  hint: 'hsl(224, 9%, 57%)',
  onInteractive: black,

  // state
  ...stateColors,

  currentColor: 'currentColor',
}

export const darkTheme: Colors = {
  // surface
  accent: brandDark,
  container: 'hsl(225, 30%, 8%)',
  module: 'hsl(222, 37%, 12%)',
  interactive: 'hsl(224, 10%, 28%)',
  outline: 'hsl(227, 10%, 37.5%)',
  dialog: black,

  // text
  onAccent: white,
  primary: white,
  secondary: 'hsl(227, 21%, 67%)',
  hint: 'hsl(225, 10%, 47.1%)',
  onInteractive: white,

  // state
  ...stateColors,

  currentColor: 'currentColor',
}

export const defaultTheme = {
  borderRadius: 1,
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

export function ThemeProvider({ theme, children }: PropsWithChildren<ThemeProps>) {
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
    borderRadius: clamp(
      Number.isFinite(theme.borderRadius) ? (theme.borderRadius as number) : theme.borderRadius ? 1 : 0
    ),
    onHover: (color: string) =>
      color === theme.primary ? transparentize(0.4, theme.primary) : mix(0.16, theme.primary, color),
  }

  function clamp(value: number) {
    return Math.min(Math.max(value, 0), 1)
  }
}
