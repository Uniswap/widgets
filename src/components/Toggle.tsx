import { transparentize } from 'polished'
import { KeyboardEvent, useCallback } from 'react'
import styled from 'styled-components/macro'
import { AnimationSpeed, ThemedText } from 'theme'

const Input = styled.input`
  -moz-appearance: none;
  -webkit-appearance: none;
  align-items: center;
  appearance: none;
  background: ${({ theme }) => theme.interactive};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  cursor: pointer;
  display: flex;
  font-size: inherit;
  font-weight: inherit;
  height: 2rem;
  margin: 0;
  padding: 0;

  position: relative;
  width: 3.5rem;

  :before {
    background-color: ${({ theme }) => theme.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.medium * 50}%;
    content: '';
    display: inline-block;
    height: 1.5rem;
    margin-left: 0.25rem;
    position: absolute;
    width: 1.5rem;
  }

  :hover:before {
    background-color: ${({ theme }) => transparentize(0.3, theme.secondary)};
  }

  :checked:before {
    background-color: ${({ theme }) => theme.accent};
    margin-left: 1.75rem;
  }

  :hover:checked:before {
    background-color: ${({ theme }) => transparentize(0.3, theme.accent)};
  }

  :checked:after {
    margin-left: 0;
  }

  :before {
    transition: margin ${AnimationSpeed.Medium} ease;
  }
`

interface ToggleProps {
  checked: boolean
  onToggle: () => void
}

export default function Toggle({ checked, onToggle }: ToggleProps) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onToggle()
      }
    },
    [onToggle]
  )
  return (
    <ThemedText.ButtonMedium>
      <Input type="checkbox" checked={checked} onChange={() => onToggle()} onKeyDown={onKeyDown} />
    </ThemedText.ButtonMedium>
  )
}
