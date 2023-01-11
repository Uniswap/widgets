import { AlertTriangle, Icon, LargeIcon } from 'icons'
import { ReactNode, useMemo } from 'react'
import styled, { css, keyframes } from 'styled-components/macro'
import { Color, Colors, ThemedText } from 'theme'

import Button from './Button'
import Row, { RowProps } from './Row'
import Tooltip from './Tooltip'

const StyledButton = styled(Button)<{ shouldUseDisabledColor?: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius * 0.75}em;
  flex-grow: 1;
  max-height: 56px;
  transition: background-color 0.25s ease-out, border-radius 0.25s ease-out, flex-grow 0.25s ease-out;
  ${({ theme, disabled, shouldUseDisabledColor }) =>
    disabled &&
    (shouldUseDisabledColor
      ? css`
          background-color: ${theme.interactive};
        `
      : css`
          opacity: 0.6;
        `)};
`

const ActionRow = styled(Row)``

const grow = keyframes`
  from {
    opacity: 0;
    width: 0;
  }
  to {
    opacity: 1;
    width: max-content;
  }
`

const actionCss = css`
  background-color: ${({ theme }) => theme.container};
  border: 1px solid ${({ theme }) => theme.outline};
  padding: calc(0.5em - 1px);
  padding-left: calc(0.75em - 1px);

  ${ActionRow} {
    animation: ${grow} 0.25s ease-in;
    flex-grow: 1;
    justify-content: flex-start;
    white-space: nowrap;
  }

  ${StyledButton} {
    /* Subtract the padding from the borderRadius so that it nests properly. */
    border-radius: ${({ theme }) => theme.borderRadius - 0.25}em;
    flex-grow: 0;
    padding: 0 0.75em;
  }
`

export const Overlay = styled(Row)<{ hasAction: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius}em;
  flex-flow: row-reverse nowrap;
  margin-top: 0.75em;
  min-height: 3.5em;
  transition: padding 0.25s ease-out;
  ${({ hasAction }) => hasAction && actionCss}
`

export interface Action {
  message: ReactNode
  icon?: Icon
  tooltipContent?: ReactNode
  onClick?: () => void
  color?: Color
  children?: ReactNode
}

type ActionButtonColor = keyof Pick<Colors, 'accent' | 'accentSoft' | 'warningSoft' | 'interactive'>

interface BaseProps {
  color?: ActionButtonColor
  action?: Action
  wrapperProps?: Omit<React.HtmlHTMLAttributes<HTMLDivElement>, keyof RowProps>
  shouldUseDisabledColor?: boolean
}

export type ActionButtonProps = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>

export default function ActionButton({
  color = 'accent',
  disabled,
  shouldUseDisabledColor = true,
  action,
  onClick,
  children,
  wrapperProps,
  ...rest
}: ActionButtonProps) {
  const textColor = useMemo(() => {
    switch (color) {
      case 'accent':
        return 'onAccent'
      case 'accentSoft':
        return 'accent'
      case 'warningSoft':
        return 'warning'
      default:
        return 'currentColor'
    }
  }, [color])

  return (
    <Overlay data-testid="action-button" hasAction={Boolean(action)} flex align="stretch" {...wrapperProps}>
      <StyledButton
        color={color}
        disabled={disabled}
        shouldUseDisabledColor={shouldUseDisabledColor}
        onClick={action?.onClick || onClick}
        {...rest}
      >
        <ThemedText.TransitionButton buttonSize={action ? 'medium' : 'large'} color={textColor}>
          {action?.children || children}
        </ThemedText.TransitionButton>
      </StyledButton>
      {action && (
        <ActionRow gap={0.5} color={action.color ?? 'primary'}>
          {action.tooltipContent ? (
            <Tooltip
              placement="right"
              icon={LargeIcon}
              iconProps={{ color: 'currentColor', icon: action.icon || AlertTriangle }}
            >
              {action.tooltipContent}
            </Tooltip>
          ) : (
            <LargeIcon color="currentColor" icon={action.icon || AlertTriangle} />
          )}
          <ThemedText.Subhead2>{action?.message}</ThemedText.Subhead2>
        </ActionRow>
      )}
    </Overlay>
  )
}
