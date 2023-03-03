import { Currency } from '@uniswap/sdk-core'
import Row from 'components/Row'
import TokenImg from 'components/TokenImg'
import { BASES_TO_CHECK_TRADES_AGAINST } from 'constants/routing'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { currencyId } from 'utils/currencyId'

const BasesContainer = styled(Row)`
  margin: 0 1.25rem;
`

const activeCss = css`
  background-color: ${({ theme }) => theme.activeSoft};
  border-color: ${({ theme }) => theme.active};
  color: ${({ theme }) => theme.active};
`

const BaseWrapper = styled(Row)<{ active?: boolean }>`
  border: 1px solid ${({ theme }) => theme.outline};
  border-radius: 1rem;
  color: ${({ theme, active }) => (active ? theme.active : theme.primary)};
  cursor: pointer;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;

  ${({ active }) => active && activeCss};

  :hover,
  :focus {
    ${activeCss}
  }
`

export default function CommonBases({
  chainId,
  onSelect,
  selected,
}: {
  chainId?: number
  selected?: Currency | null
  onSelect: (currency: Currency) => void
}) {
  if (!chainId) {
    return null
  }
  const bases = BASES_TO_CHECK_TRADES_AGAINST[chainId]
  if (bases.length === 0) {
    return null
  }
  return (
    <BasesContainer gap={0.5} flex justify="start">
      {bases.map((currency: Currency) => {
        const isSelected = selected?.equals(currency)
        const onKeyPress = (e: React.KeyboardEvent) => e.key === 'Enter' && onSelect(currency)
        return (
          <BaseWrapper
            flex
            tabIndex={0}
            data-testid={`common-base-${currency.symbol}`}
            onKeyPress={!isSelected ? onKeyPress : undefined}
            onClick={!isSelected ? () => onSelect(currency) : undefined}
            active={isSelected}
            key={currencyId(currency)}
            gap={0.25}
          >
            <TokenImg token={currency} size={1.25} />
            <ThemedText.ButtonMedium lineHeight="1.25rem">{currency.symbol}</ThemedText.ButtonMedium>
          </BaseWrapper>
        )
      })}
    </BasesContainer>
  )
}
