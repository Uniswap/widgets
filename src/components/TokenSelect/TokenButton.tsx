import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { ChevronDown } from 'icons'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Button from '../Button'
import Row from '../Row'
import TokenImg from '../TokenImg'

const StyledTokenButton = styled(Button)<{ approved?: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius}em;
  padding: 0.25em;

  :enabled {
    transition: none;
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
  return (
    <StyledTokenButton
      onClick={onClick}
      color={value ? 'interactive' : 'accent'}
      approved={approved}
      disabled={disabled}
      data-testid="token-select"
    >
      <ThemedText.ButtonLarge color={value ? 'currentColor' : 'onAccent'}>
        <TokenButtonRow empty={!value} flex gap={0.4}>
          {value ? (
            <>
              <TokenImg token={value} size={1.2} />
              <span>{value.symbol}</span>
            </>
          ) : (
            <Trans>Select a token</Trans>
          )}
          <ChevronDown strokeWidth={2} />
        </TokenButtonRow>
      </ThemedText.ButtonLarge>
    </StyledTokenButton>
  )
}
