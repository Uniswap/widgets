export interface Colors {
  // surface
  accent: string
  accentSoft: string
  container: string
  module: string
  interactive: string
  outline: string
  dialog: string
  scrim: string

  // text
  primary: string
  onAccent: string
  secondary: string
  hint: string
  onInteractive: string

  // state
  active: string
  activeSoft: string
  success: string
  warning: string
  warningSoft: string
  error: string
  critical: string
  criticalSoft: string

  networkDefaultShadow: string
  deepShadow: string

  currentColor: 'currentColor'
}

export type Color = keyof Colors

export type ThemeBorderRadius = {
  large: number
  medium: number
  small: number
  xsmall: number
}

export type ZIndex = {
  modal: number
}

export interface Attributes {
  borderRadius: ThemeBorderRadius
  zIndex: ZIndex
  fontFamily:
    | string
    | {
        font: string
        variable: string
      }
  fontFamilyCode: string
  tokenColorExtraction: boolean
}

export interface Theme extends Partial<Attributes>, Partial<Colors> {}
