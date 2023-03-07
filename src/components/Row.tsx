import { Children, ReactNode } from 'react'
import styled from 'styled-components/macro'
import { Color, Theme } from 'theme'

export interface RowProps {
  color?: Color
  align?: string
  justify?: string
  flow?: string
  pad?: number
  gap?: number
  flex?: true
  grow?: true | 'first' | 'last'
  children?: ReactNode
  theme: Theme
}

const Row = styled.div<RowProps>`
  align-items: ${({ align }) => align ?? 'center'};
  color: ${({ color, theme }) => color && theme[color]};
  display: ${({ flex }) => (flex ? 'flex' : 'grid')};
  flex-flow: ${({ flow }) => flow ?? 'wrap'};
  flex-grow: ${({ grow }) => grow && 1};
  gap: ${({ gap }) => gap && `${gap}rem`};
  grid-auto-flow: column;
  grid-template-columns: ${({ grow, children }) => {
    if (grow === 'first') return '1fr'
    if (grow === 'last') return `repeat(${Children.count(children) - 1}, auto) 1fr`
    if (grow) return `repeat(${Children.count(children)}, 1fr)`
    return undefined
  }};
  justify-content: ${({ justify }) => justify ?? 'space-between'};
  padding: ${({ pad }) => pad && `0 ${pad}rem`};
`

export default Row
