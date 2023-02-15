import { Placement } from '@popperjs/core'
import useHasFocus from 'hooks/useHasFocus'
import useHasHover from 'hooks/useHasHover'
import { Icon, Info } from 'icons'
import { ComponentProps, ReactNode, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { IconButton } from './Button'
import Popover from './Popover'

export function useTooltip(tooltip: Node | null | undefined): boolean {
  const hover = useHasHover(tooltip)
  const focus = useHasFocus(tooltip)
  return hover || focus
}

export const SmallToolTipBody = styled(ThemedText.Caption)`
  max-width: 220px;
`

const IconTooltip = styled(IconButton)`
  cursor: help;
`

interface TooltipBaseProps {
  children: ReactNode
  placement?: Placement
  offset?: number
  contained?: true
}

interface TooltipProps extends TooltipBaseProps {
  icon?: Icon
  iconProps?: ComponentProps<Icon>
}

export default function Tooltip({
  icon: Icon = Info,
  iconProps,
  children,
  placement = 'auto',
  offset,
  contained,
}: TooltipProps) {
  const [tooltip, setTooltip] = useState<HTMLDivElement>()
  const showTooltip = useTooltip(tooltip)
  return (
    <Popover content={children} show={showTooltip} placement={placement} offset={offset} contained={contained}>
      <IconTooltip icon={Icon} iconProps={iconProps} ref={setTooltip} />
    </Popover>
  )
}

interface TooltipTextProps extends TooltipBaseProps {
  text?: ReactNode
}

export function TooltipText({ text, children, placement = 'auto', offset, contained }: TooltipTextProps) {
  const [tooltip, setTooltip] = useState<HTMLDivElement | null>()
  const showTooltip = useTooltip(tooltip)
  return (
    <Popover content={children} show={showTooltip} placement={placement} offset={offset} contained={contained}>
      <div ref={setTooltip}>{text}</div>
    </Popover>
  )
}
