import { Icon } from 'icons'
import { ComponentProps, forwardRef } from 'react'
import styled, { css } from 'styled-components/macro'
import { Color } from 'theme'

export const BaseButton = styled.button`
  background-color: transparent;
  border: none;
  border-radius: 0.5em;
  color: currentColor;
  cursor: pointer;
  font-size: inherit;
  font-weight: inherit;
  height: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;

  :enabled {
    transition: filter 0.125s linear;
  }

  :disabled {
    cursor: initial;
    filter: opacity(0.4);
  }
`
const transitionCss = css`
  transition: background-color 0.125s linear, border-color 0.125s linear, filter 0.125s linear;
`

export default styled(BaseButton)<{ color?: Color; transition?: boolean }>`
  background-color: ${({ color = 'interactive', theme }) => theme[color]};
  border: 1px solid transparent;
  color: ${({ color = 'interactive', theme }) => color === 'interactive' && theme.onInteractive};

  :enabled {
    ${({ transition = true }) => transition && transitionCss};
  }

  :enabled:hover {
    background-color: ${({ color = 'interactive', theme }) => theme.onHover(theme[color])};
  }
`

const transparentButton = (defaultColor: Color) => styled(BaseButton)<{ color?: Color }>`
  color: ${({ color = defaultColor, theme }) => theme[color]};

  :enabled:hover {
    color: ${({ color = defaultColor, theme }) => theme.onHover(theme[color])};
  }
`

export const TextButton = transparentButton('accent')

const SecondaryButton = transparentButton('secondary')

interface IconButtonProps {
  icon: Icon
  iconProps?: ComponentProps<Icon>
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps & ComponentProps<typeof BaseButton>>(
  function IconButton({ icon: Icon, iconProps, ...props }: IconButtonProps & ComponentProps<typeof BaseButton>, ref) {
    return (
      <SecondaryButton {...props} ref={ref} style={{ transform: 'translateY(2px)' }}>
        <Icon {...iconProps} />
      </SecondaryButton>
    )
  }
)
