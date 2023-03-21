import Row from 'components/Row'
import { ChainImg } from 'components/TokenImg'
import { getChainInfo } from 'constants/chainInfo'
import { VISIBLE_CHAIN_IDS, VISIBLE_TESTNET_CHAIN_IDS } from 'constants/chains'
import { getNativeLogoURI } from 'hooks/useCurrencyLogoURIs'
import { useTestnetsVisible } from 'hooks/useSyncWidgetSettings'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

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
  padding: 0.25em 0.5em 0.25em 0.25em;

  ${({ active }) => active && activeCss};

  :hover {
    background-color: ${({ color = 'interactive', theme }) => theme.onHover(theme[color])};
  }
`

export default function ChainFilter({
  onSelect,
  selected,
  chainIdsAllowed,
}: {
  selected?: number
  onSelect: (chainId?: number) => void
  chainIdsAllowed?: number[]
}) {
  const testnetsVisible = useTestnetsVisible()
  let chainIds = testnetsVisible ? [...VISIBLE_CHAIN_IDS, ...VISIBLE_TESTNET_CHAIN_IDS] : VISIBLE_CHAIN_IDS

  if (chainIdsAllowed && chainIdsAllowed.length !== 0) {
    chainIds = chainIds.filter((x) => chainIdsAllowed.includes(x))
  }

  if (chainIds.length <= 1) {
    return null
  }

  return (
    <BasesContainer gap={0.5} flex justify="start">
      {chainIds.map((chainId) => {
        const isSelected = selected === chainId
        const handleClick = () => onSelect(isSelected ? undefined : chainId)
        const chainInfo = getChainInfo(chainId)
        const chainSrc = getNativeLogoURI(chainId)

        return (
          <BaseWrapper
            flex
            tabIndex={0}
            data-testid={`chain-filter-${chainId}`}
            onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleClick()}
            onClick={handleClick}
            active={isSelected}
            key={chainId}
            gap={0.25}
          >
            <ChainImg src={chainSrc} size={1.5} />
            <ThemedText.ButtonSmall fontWeight={600} lineHeight="1em">
              {chainInfo?.label}
            </ThemedText.ButtonSmall>
          </BaseWrapper>
        )
      })}
    </BasesContainer>
  )
}
