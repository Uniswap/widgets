import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { Logo } from 'components/Logo'
import { ChevronDown } from 'icons'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Button from '../Button'
import Row from '../Row'
import TokenImg from '../TokenImg'

const StyledTokenButton = styled(Button)<{ approved?: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  min-height: 2rem;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;

  :enabled {
    transition: none;
  }

  ${TokenImg} {
    filter: ${({ approved }) => approved === false && 'grayscale(1)'};
  }
`

const TokenButtonRow = styled(Row)<{ empty: boolean }>`
  max-width: 12rem;
  overflow: hidden;
  padding-left: ${({ empty }) => empty && 0.5}rem;
  width: max-content;

  img {
    min-width: 1.2rem;
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
      <TokenButtonRow empty={!value} flex gap={0.4} flow="nowrap">
        {value ? (
          <>
            <Logo currency={value} symbol={value.symbol} />
            <ThemedText.ButtonLarge color={'currentColor'}>
              <span>{value.symbol}</span>
            </ThemedText.ButtonLarge>
          </>
        ) : (
          <ThemedText.ButtonLarge
            color={'onAccent'}
            style={{ maxWidth: '10rem', textOverflow: 'ellipsis', overflow: 'hidden' }}
          >
            <Trans>Select token</Trans>
          </ThemedText.ButtonLarge>
        )}
        <ChevronDown strokeWidth={2} color={value ? 'primary' : 'onAccent'} />
      </TokenButtonRow>
    </StyledTokenButton>
  )
}
