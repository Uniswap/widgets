import { Currency } from '@uniswap/sdk-core'
import Row from 'components/Row'
import TokenImg from 'components/TokenImg'
import { BASES_TO_CHECK_TRADES_AGAINST } from 'constants/routing'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { currencyId } from 'utils/currencyId'

const BasesContainer = styled(Row)`
  margin: 0 1.25em;
`

const activeCss = css`
  background-color: ${({ theme }) => theme.activeSoft};
  border-color: ${({ theme }) => theme.active};
  color: ${({ theme }) => theme.active};
`

const BaseWrapper = styled(Row)<{ active?: boolean }>`
  border: 1px solid ${({ theme }) => theme.outline};
  border-radius: 1em;
  color: ${({ theme, active }) => (active ? theme.active : theme.primary)};
  cursor: pointer;
  padding: 0.5em 0.75em 0.5em 0.5em;

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
        return (
          <BaseWrapper
            flex
            tabIndex={0}
            data-testid={`common-base-${currency.symbol}`}
            onKeyPress={
              !isSelected
                ? (e) => {
                    console.log({ e })
                    e.key === 'Enter' && onSelect(currency)
                  }
                : undefined
            }
            onClick={!isSelected ? () => onSelect(currency) : undefined}
            active={isSelected}
            key={currencyId(currency)}
            gap={0.25}
          >
            <TokenImg token={currency} />
            <ThemedText.ButtonMedium fontWeight={600} lineHeight="1.25em">
              {currency.symbol}
            </ThemedText.ButtonMedium>
          </BaseWrapper>
        )
      })}
    </BasesContainer>
  )
}
