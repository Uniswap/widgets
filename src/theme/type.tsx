import { Text, TextProps as TextPropsWithCss } from 'rebass'
import styled, { useTheme } from 'styled-components/macro'

import { AnimationSpeed } from './animations'
import type { Color } from './theme'

type TextProps = Omit<TextPropsWithCss, 'css' | 'color' | 'userSelect'> & {
  color?: Color
  userSelect?: boolean
  $inline?: boolean
}

const TextWrapper = styled(Text)<{
  color?: Color
  lineHeight: string
  noWrap?: true
  userSelect?: boolean
  $inline?: boolean
}>`
  color: ${({ color = 'currentColor', theme }) => theme[color as Color]};
  // Avoid the need for placeholders by setting min-height to line-height.
  min-height: ${({ lineHeight }) => lineHeight};
  // user-select is set to 'none' at the root element (Widget), but is desired for displayed data.
  // user-select must be configured through styled-components for cross-browser compat (eg to auto-generate prefixed properties).
  user-select: ${({ userSelect }) => (userSelect === true ? 'text' : userSelect === false ? 'none' : undefined)};
  white-space: ${({ noWrap }) => noWrap && 'nowrap'};
  display: ${({ $inline }) => $inline && 'inline'};
`

const TransitionTextWrapper = styled(TextWrapper)`
  transition: font-size ${AnimationSpeed.Medium} ease-out, line-height ${AnimationSpeed.Medium} ease-out;
`

export function H1(props: TextProps) {
  return (
    <TextWrapper className="headline headline-1" fontSize={36} fontWeight={500} lineHeight="44px" noWrap {...props} />
  )
}

export function H2(props: TextProps) {
  return (
    <TextWrapper className="headline headline-2" fontSize={32} fontWeight={500} lineHeight="32px" noWrap {...props} />
  )
}

export function H3(props: TextProps) {
  return (
    <TextWrapper className="headline headline-3" fontSize={20} fontWeight={500} lineHeight="20px" noWrap {...props} />
  )
}

export function H4(props: TextProps) {
  return (
    <TextWrapper className="headline headline-4" fontSize={20} fontWeight={500} lineHeight="28px" noWrap {...props} />
  )
}

export function Subhead1(props: TextProps) {
  return (
    <TextWrapper className="subhead subhead-1" fontSize={16} fontWeight={500} lineHeight="24px" noWrap {...props} />
  )
}

export function Subhead2(props: TextProps) {
  return (
    <TextWrapper className="subhead subhead-2" fontSize={14} fontWeight={500} lineHeight="20px" noWrap {...props} />
  )
}

export function Body1(props: TextProps) {
  return <TextWrapper className="body body-1" fontSize={16} fontWeight={400} lineHeight="24px" {...props} />
}

export const Body2LineHeightRem = 1.25

export function Body2(props: TextProps) {
  return (
    <TextWrapper
      className="body body-2"
      fontSize={14}
      fontWeight={400}
      lineHeight={`${Body2LineHeightRem}rem`}
      {...props}
    />
  )
}

export function Caption(props: TextProps) {
  return <TextWrapper className="caption" fontSize={12} fontWeight={400} lineHeight="16px" {...props} />
}

export function Badge(props: TextProps) {
  return <TextWrapper className="badge" fontSize="8px" fontWeight={600} lineHeight="8px" noWrap {...props} />
}

export function ButtonLarge(props: TextProps) {
  return (
    <TextWrapper className="button button-large" fontSize={20} fontWeight={600} lineHeight="24px" noWrap {...props} />
  )
}

export function ButtonMedium(props: TextProps) {
  return (
    <TextWrapper className="button button-medium" fontSize={16} fontWeight={500} lineHeight="16px" noWrap {...props} />
  )
}

export function ButtonSmall(props: TextProps) {
  return (
    <TextWrapper className="button button-small" fontSize={14} fontWeight={600} lineHeight="14px" noWrap {...props} />
  )
}

export function TransitionButton(props: TextProps & { buttonSize: 'small' | 'medium' | 'large' }) {
  const className = `button button-${props.buttonSize}`
  const fontSize = { small: 14, medium: 16, large: 20 }[props.buttonSize]
  const lineHeight = `${fontSize}px`
  return (
    <TransitionTextWrapper
      className={className}
      fontSize={fontSize}
      fontWeight={600}
      lineHeight={lineHeight}
      noWrap
      {...props}
    />
  )
}

export function Code(props: TextProps) {
  const { fontFamilyCode } = useTheme()
  return (
    <TextWrapper
      className="code"
      fontSize={12}
      fontWeight={400}
      lineHeight="16px"
      fontFamily={fontFamilyCode}
      {...props}
    />
  )
}
