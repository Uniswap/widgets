import { Info } from 'icons'
import { ReactNode } from 'react'
import styled, { AnyStyledComponent, css } from 'styled-components/macro'
import { ThemedText } from 'theme'

import Row from '../../Row'
import Tooltip from '../../Tooltip'

export const optionCss = (selected: boolean) => css`
  border: 1px solid ${({ theme }) => (selected ? theme.active : '')};
  border-radius: ${({ theme }) => theme.borderRadius.small}rem;
  color: ${({ theme }) => theme.primary} !important;
  display: grid;
  grid-gap: 0.25rem;
  padding: calc(0.75rem - 1px) 0.625rem;

  :enabled {
    border: 1px solid ${({ theme }) => (selected ? theme.active : theme.outline)};
  }

  :enabled:hover {
    border-color: ${({ theme }) => theme.onHover(selected ? theme.active : theme.outline)};
  }

  :enabled:focus-within {
    border-color: ${({ theme }) => theme.active};
  }
`

export function value(Value: AnyStyledComponent) {
  return styled(Value)<{ selected?: boolean; cursor?: string }>`
    cursor: ${({ cursor }) => cursor ?? 'pointer'};
  `
}

interface LabelProps {
  name: ReactNode
  tooltip?: ReactNode
}

export function Label({ name, tooltip }: LabelProps) {
  return (
    <Row gap={0.5} justify="flex-start" flex align="center">
      <ThemedText.Subhead2>{name}</ThemedText.Subhead2>
      {tooltip && (
        <Tooltip placement="top" contained icon={Info} iconProps={{ style: { height: '100%' } }}>
          <ThemedText.Caption>{tooltip}</ThemedText.Caption>
        </Tooltip>
      )}
    </Row>
  )
}
