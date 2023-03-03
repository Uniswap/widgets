import styled, { css } from 'styled-components/macro'
import { Color } from 'theme'

export interface ColumnProps {
  align?: string
  color?: Color
  justify?: string
  gap?: number
  padded?: true
  padding?: string
  flex?: true
  grow?: true
  css?: ReturnType<typeof css>
}

const Column = styled.div<ColumnProps>`
  align-items: ${({ align }) => align ?? 'center'};
  color: ${({ color, theme }) => color && theme[color]};
  display: ${({ flex }) => (flex ? 'flex' : 'grid')};
  flex-direction: column;
  flex-grow: ${({ grow }) => grow && 1};
  gap: ${({ gap }) => gap && `${gap}rem`};
  grid-auto-flow: row;
  grid-template-columns: 1fr;
  justify-content: ${({ justify }) => justify ?? 'space-between'};
  padding: ${({ padded, padding }) => padding ?? (padded ? '0.75rem' : 'unset')};

  ${({ css }) => css}
`

export default Column
