import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { getChainInfo } from 'constants/chainInfo'
import { getNativeLogoURI } from 'hooks/useCurrencyLogoURIs'
import { ChevronDown } from 'icons'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Button from '../Button'
import Row from '../Row'
import TokenImg, { ChainImgBadge, TokenGroup } from '../TokenImg'

const StyledTokenButton = styled(Button)<{ approved?: boolean; presetValue?: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius.medium}em;
  min-height: 2em;
  padding: 0.25em 0.5em 0.25em 0.25em;

  :enabled {
    transition: none;
  }

  ${TokenGroup} {
    filter: ${({ approved }) => approved === false && 'grayscale(1)'};
  }
`

const TokenButtonRow = styled(Row)<{ empty: boolean }>`
  flex-direction: row;
  flex-flow: nowrap;
  max-width: 12em;
  overflow: hidden;
  padding-left: ${({ empty }) => empty && 0.5}em;
  width: max-content;
`

const SelectButton = styled(ThemedText.ButtonLarge)`
  align-items: flex-start;
  display: flex;
  flex-direction: column;

  & > * {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const DropDownIcon = styled(ChevronDown)`
  min-width: 1em;
`

interface TokenButtonProps {
  value?: Currency
  approved?: boolean
  disabled?: boolean
  onClick: () => void
}

export default function TokenButton({ value, approved, disabled, onClick }: TokenButtonProps) {
  const chainInfo = getChainInfo(value?.chainId)
  const chainSrc = getNativeLogoURI(value?.chainId)

  return (
    <StyledTokenButton
      onClick={onClick}
      color={value ? 'interactive' : 'accent'}
      approved={approved}
      disabled={disabled}
      data-testid="token-select"
    >
      <TokenButtonRow empty={!value} flex gap={0.4}>
        {value ? (
          <>
            <TokenGroup size={2}>
              <TokenImg token={value} size={2} />
              <ChainImgBadge src={chainSrc} size={2} />
            </TokenGroup>
            <SelectButton color={'currentColor'}>
              <span>{value.symbol}</span>
              <ThemedText.Caption color="secondary"> on {chainInfo?.label}</ThemedText.Caption>
            </SelectButton>
          </>
        ) : (
          <ThemedText.ButtonLarge color={'onAccent'}>
            <Trans>Select token</Trans>
          </ThemedText.ButtonLarge>
        )}
        <DropDownIcon strokeWidth={2} color={value ? 'primary' : 'onAccent'} />
      </TokenButtonRow>
    </StyledTokenButton>
  )
}
