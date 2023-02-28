import { AlertTriangle, Icon, LargeIcon } from 'icons'
import { ReactNode, useMemo } from 'react'
import styled, { css, keyframes } from 'styled-components/macro'
import { AnimationSpeed, Color, Colors, ThemedText } from 'theme'

import Button from './Button'
import Row, { RowProps } from './Row'
import Tooltip from './Tooltip'

const StyledButton = styled(Button)<{ shouldUseDisabledColor?: boolean; narrow?: boolean }>`
  border-radius: ${({ theme, narrow }) => (narrow ? theme.borderRadius.small : theme.borderRadius.medium)}em;
  flex-grow: 1;
  max-height: ${({ narrow }) => (narrow ? '2.5em' : '3.5em')};
  transition: background-color ${AnimationSpeed.Medium} ease-out, border-radius ${AnimationSpeed.Medium} ease-out,
    flex-grow ${AnimationSpeed.Medium} ease-out;
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
  border: 1px solid ${({ theme }) => theme.outline};
  padding: calc(0.5em - 1px);
  padding-left: calc(0.75em - 1px);

  ${ActionRow} {
    animation: ${grow} ${AnimationSpeed.Medium} ease-in;
    flex-grow: 1;
    justify-content: flex-start;
    white-space: nowrap;
  }

  ${StyledButton} {
    /* Subtract the padding from the borderRadius so that it nests properly. */
    border-radius: ${({ theme }) => theme.borderRadius.medium}em;
    flex-grow: 0;
    padding: 0 0.75em;
  }
`

export const Overlay = styled(Row)<{ hasAction: boolean; narrow?: boolean }>`
  border-radius: ${({ theme, narrow }) => (narrow ? theme.borderRadius.small : theme.borderRadius.medium)}em;
  flex-flow: row-reverse nowrap;
  margin-top: 0.25em;
  min-height: ${({ narrow }) => (narrow ? '2.5em' : '3.5em')};
  transition: padding ${AnimationSpeed.Medium} ease-out;
  ${({ hasAction }) => hasAction && actionCss}
`

export interface Action {
  message: ReactNode
  icon?: Icon
  tooltipContent?: ReactNode
  onClick?: () => void
  color?: Color
  children?: ReactNode
  hideButton?: boolean
  disableButton?: boolean
}

export type ActionButtonColor = keyof Pick<Colors, 'accent' | 'accentSoft' | 'warningSoft' | 'interactive' | 'critical'>

interface BaseProps {
  color?: ActionButtonColor
  action?: Action
  wrapperProps?: Omit<React.HtmlHTMLAttributes<HTMLDivElement>, keyof RowProps>
  shouldUseDisabledColor?: boolean
  narrow?: boolean
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
  narrow,
  ...rest
}: ActionButtonProps) {
  const textColor = useMemo(() => {
    if (disabled) {
      return 'primary'
    }
    switch (color) {
      case 'accent':
      case 'critical':
        return 'onAccent'
      case 'accentSoft':
        return 'accent'
      case 'warningSoft':
        return 'warning'
      default:
        return 'currentColor'
    }
  }, [color, disabled])

  const buttonSize = useMemo(() => (narrow ? 'small' : action ? 'medium' : 'large'), [narrow, action])

  return (
    <Overlay
      data-testid="action-button"
      hasAction={Boolean(action)}
      flex
      align="stretch"
      narrow={narrow}
      {...wrapperProps}
    >
      {!action?.hideButton && (
        <StyledButton
          color={color}
          disabled={disabled || action?.disableButton}
          shouldUseDisabledColor={shouldUseDisabledColor}
          onClick={action?.onClick || onClick}
          narrow={narrow}
          {...rest}
        >
          <ThemedText.TransitionButton buttonSize={buttonSize} color={textColor}>
            {action?.children || children}
          </ThemedText.TransitionButton>
        </StyledButton>
      )}
      {action && (
        <ActionRow gap={0.5} color={action.color ?? 'primary'}>
          {action.tooltipContent ? (
            <Tooltip
              placement="right"
              icon={LargeIcon}
              iconProps={{ color: action.color ?? 'currentColor', icon: action.icon || AlertTriangle }}
            >
              {action.tooltipContent}
            </Tooltip>
          ) : (
            <LargeIcon color={action.color ?? 'currentColor'} icon={action.icon || AlertTriangle} />
          )}
          <ThemedText.Subhead2>{action?.message}</ThemedText.Subhead2>
        </ActionRow>
      )}
    </Overlay>
  )
}
