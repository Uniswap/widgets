import { Placement } from '@popperjs/core'
import useHasFocus from 'hooks/useHasFocus'
import useHasHover from 'hooks/useHasHover'
import { HelpCircle, Icon } from 'icons'
import { ComponentProps, ReactNode, useState } from 'react'
import styled from 'styled-components/macro'

import { IconButton } from './Button'
import Popover from './Popover'

export function useTooltip(tooltip: Node | null | undefined): boolean {
  const hover = useHasHover(tooltip)
  const focus = useHasFocus(tooltip)
  return hover || focus
}

const IconTooltip = styled(IconButton)`
  cursor: help;
`

interface TooltipProps {
  icon?: Icon
  iconProps?: ComponentProps<Icon>
  children: ReactNode
  placement?: Placement
  offset?: number
  contained?: true
}

export default function Tooltip({
  icon: Icon = HelpCircle,
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
