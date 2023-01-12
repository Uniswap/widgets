import { Currency } from '@uniswap/sdk-core'
import Row from 'components/Row'
import TokenImg from 'components/TokenImg'
import { BASES_TO_CHECK_TRADES_AGAINST } from 'constants/routing'
import { transparentize } from 'polished'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { currencyId } from 'utils/currencyId'

const BasesContainer = styled(Row)`
  margin: 0 1.25em;
`

const BaseWrapper = styled.div<{ active?: boolean }>`
  align-items: center;
  background-color: ${({ theme, active }) => (active ? transparentize(0.76, theme.active) : 'transparent')};
  border: 1px solid ${({ theme, active }) => (active ? theme.active : theme.outline)};
  border-radius: 1em;
  color: ${({ theme, active }) => (active ? theme.active : theme.primary)};

  display: flex;
  :hover {
    background-color: ${({ theme }) => transparentize(0.76, theme.active)};
    color: ${({ theme }) => theme.active};
    cursor: pointer;
  }

  padding: 0.5em 0.75em 0.5em;
`

const StyledTokenImg = styled(TokenImg)`
  margin-right: 0.5em;
`

export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency,
}: {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
}) {
  const bases = typeof chainId !== 'undefined' ? BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? [] : []

  return bases.length > 0 ? (
    <BasesContainer gap={0.5} flex justify="start">
      {bases.map((currency: Currency) => {
        const isSelected = selectedCurrency?.equals(currency)

        return (
          <BaseWrapper
            tabIndex={0}
            onKeyPress={(e) => !isSelected && e.key === 'Enter' && onSelect(currency)}
            onClick={() => !isSelected && onSelect(currency)}
            active={isSelected}
            key={currencyId(currency)}
          >
            <StyledTokenImg token={currency} />
            <ThemedText.ButtonMedium>{currency.symbol}</ThemedText.ButtonMedium>
          </BaseWrapper>
        )
      })}
    </BasesContainer>
  ) : null
}
