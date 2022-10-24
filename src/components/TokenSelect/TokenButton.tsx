import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { ChevronDown } from 'icons'
import { useEffect, useMemo, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

import Button from '../Button'
import Row from '../Row'
import TokenImg from '../TokenImg'

const transitionCss = css`
  transition: background-color 0.125s linear, border-color 0.125s linear, filter 0.125s linear, width 0.125s ease-out;
`

const StyledTokenButton = styled(Button)<{ approved?: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius}em;
  padding: 0.25em;

  :enabled {
    ${({ transition }) => transition && transitionCss};
  }

  ${TokenImg} {
    filter: ${({ approved }) => approved === false && 'grayscale(1)'};
  }
`

const TokenButtonRow = styled(Row)<{ empty: boolean }>`
  flex-direction: row;
  height: 1.2em;
  max-width: 12em;
  overflow: hidden;
  padding-left: ${({ empty }) => empty && 0.5}em;
  width: max-content;

  img {
    min-width: 1.2em;
  }
`

interface TokenButtonProps {
  value?: Currency
  approved?: boolean
  disabled?: boolean
  onClick: () => void
}

export default function TokenButton({ value, approved, disabled, onClick }: TokenButtonProps) {
  const buttonBackgroundColor = value ? 'interactive' : 'accent'
  const contentColor = buttonBackgroundColor === 'accent' ? 'onAccent' : 'currentColor'

  // Transition the button only if transitioning from a disabled state.
  // This makes initialization cleaner without adding distracting UX to normal swap flows.
  const [shouldTransition, setShouldTransition] = useState(disabled)
  useEffect(() => {
    if (disabled) {
      setShouldTransition(true)
    }
  }, [disabled])

  // width must have an absolute value in order to transition, so it is taken from the row ref.
  const [row, setRow] = useState<HTMLDivElement | null>(null)
  const style = useMemo(() => {
    if (!shouldTransition) return
    return { width: row ? row.clientWidth + /* padding= */ 8 + /* border= */ 2 : undefined }
  }, [row, shouldTransition])

  return (
    <StyledTokenButton
      onClick={onClick}
      color={buttonBackgroundColor}
      approved={approved}
      disabled={disabled}
      style={style}
      transition={shouldTransition}
      onTransitionEnd={() => setShouldTransition(false)}
      data-testid="token-select"
    >
      <ThemedText.ButtonLarge color={contentColor}>
        <TokenButtonRow
          empty={!value}
          flex
          gap={0.4}
          // ref is used to set an absolute width, so it must be reset for each value passed.
          // To force this, value?.symbol is passed as a key.
          ref={setRow}
          key={value?.wrapped.address}
        >
          {value ? (
            <>
              <TokenImg token={value} size={1.2} />
              <span>{value.symbol}</span>
            </>
          ) : (
            <Trans>Select a token</Trans>
          )}
          <ChevronDown color={contentColor} strokeWidth={2} />
        </TokenButtonRow>
      </ThemedText.ButtonLarge>
    </StyledTokenButton>
  )
}
