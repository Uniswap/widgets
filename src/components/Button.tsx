import { Icon } from 'icons'
import { ComponentProps, forwardRef } from 'react'
import styled from 'styled-components/macro'
import { AnimationSpeed, Color } from 'theme'

export const BaseButton = styled.button`
  background-color: transparent;
  border: none;
  border-radius: 0.5rem;
  color: currentColor;
  cursor: pointer;
  font-size: inherit;
  font-weight: inherit;
  height: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;

  :enabled {
    transition: filter ${AnimationSpeed.Fast} linear;
  }

  :disabled {
    cursor: initial;
    filter: opacity(0.6);
  }
`

export default styled(BaseButton)<{ color?: Color }>`
  background-color: ${({ color = 'interactive', theme }) => theme[color]};
  border: 1px solid transparent;
  color: ${({ color = 'interactive', theme }) => color === 'interactive' && theme.onInteractive};

  :enabled:hover {
    background-color: ${({ color = 'interactive', theme }) => theme.onHover(theme[color])};
  }
`

const transparentButton = (defaultColor: Color) => styled(BaseButton)<{ color?: Color }>`
  color: ${({ color = defaultColor, theme }) => theme[color]};

  :enabled:hover {
    color: ${({ color = defaultColor, theme }) => theme.onHover(theme[color])};
    * {
      color: ${({ color = defaultColor, theme }) => theme.onHover(theme[color])};
    }
  }
`

export const TextButton = transparentButton('accent')

const SecondaryButton = transparentButton('secondary')

const StyledIconButton = styled(SecondaryButton)`
  height: 1rem;
`

interface IconButtonProps {
  icon: Icon
  iconProps?: ComponentProps<Icon>
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps & ComponentProps<typeof BaseButton>>(
  function IconButton({ icon: Icon, iconProps, ...props }: IconButtonProps & ComponentProps<typeof BaseButton>, ref) {
    return (
      <StyledIconButton {...props} ref={ref}>
        <Icon {...iconProps} />
      </StyledIconButton>
    )
  }
)
