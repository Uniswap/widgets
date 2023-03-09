import { t, Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { inputCss, StringInput } from 'components/Input'
import { ResponsiveDialog } from 'components/ResponsiveDialog'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { useCurrencyBalances } from 'hooks/useCurrencyBalance'
import useNativeCurrency from 'hooks/useNativeCurrency'
import useTokenList, { useIsTokenListLoaded, useQueryTokens } from 'hooks/useTokenList'
import { Search } from 'icons'
import { useAtomValue } from 'jotai/utils'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Field, swapEventHandlersAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Column from '../Column'
import Dialog, { Header, useIsDialogPageCentered } from '../Dialog'
import Row from '../Row'
import Rule from '../Rule'
import CommonBases from './CommonBases'
import NoTokensAvailableOnNetwork from './NoTokensAvailableOnNetwork'
import TokenButton from './TokenButton'
import TokenOptions, { TokenOptionsHandle } from './TokenOptions'
import TokenOptionsSkeleton from './TokenOptionsSkeleton'

const SearchInputContainer = styled(Row)`
  ${inputCss}
`

const TokenSelectContainer = styled.div<{ $pageCentered: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius.medium}rem;
  min-height: ${($pageCentered) => ($pageCentered ? 'unset' : '100%')};
  min-width: ${({ $pageCentered }) => ($pageCentered ? "min(400px, '100vw')" : 'auto')};
  overflow: hidden;
  padding: 0.5rem 0 0;
  @supports (overflow: clip) {
    overflow: 'clip';
  }
`

function usePrefetchBalances() {
  const { account } = useWeb3React()
  const tokenList = useTokenList()
  const prefetchedTokenList = useRef<typeof tokenList>()
  useCurrencyBalances(account, tokenList !== prefetchedTokenList.current ? tokenList : undefined)
  prefetchedTokenList.current = tokenList
}

function useAreBalancesLoaded(): boolean {
  const { account } = useWeb3React()
  const tokens = useTokenList()
  const native = useNativeCurrency()
  const currencies = useMemo(() => [native, ...tokens], [native, tokens])
  const balances = useCurrencyBalances(account, currencies).filter(Boolean)
  return !account || currencies.length === balances.length
}

interface TokenSelectDialogProps {
  value?: Currency
  onSelect: (token: Currency) => void
  onClose: () => void
}

export function TokenSelectDialogContent({ value, onSelect, onClose }: TokenSelectDialogProps) {
  const [query, setQuery] = useState('')
  const list = useTokenList()
  const tokens = useQueryTokens(query, list)

  const isPageCentered = useIsDialogPageCentered()

  const isTokenListLoaded = useIsTokenListLoaded()
  const areBalancesLoaded = useAreBalancesLoaded()
  const [isLoaded, setIsLoaded] = useState(isTokenListLoaded && areBalancesLoaded)
  // Give the balance-less tokens a small block period to avoid layout thrashing from re-sorting.
  useEffect(() => {
    if (!isLoaded) {
      const timeout = setTimeout(() => setIsLoaded(true), 250)
      return () => clearTimeout(timeout)
    }
    return
  }, [isLoaded])
  useEffect(
    () => setIsLoaded(Boolean(query) || (isTokenListLoaded && areBalancesLoaded)),
    [query, areBalancesLoaded, isTokenListLoaded]
  )

  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus({ preventScroll: true }), [input])

  const [options, setOptions] = useState<TokenOptionsHandle | null>(null)
  const { chainId } = useWeb3React()
  const listHasTokens = useMemo(() => list.some((token) => token.chainId === chainId), [chainId, list])

  if (!listHasTokens && isLoaded) {
    return (
      <Dialog color="container" onClose={onClose}>
        <Header title={<Trans>Select token</Trans>} />
        <NoTokensAvailableOnNetwork />
      </Dialog>
    )
  }
  return (
    <TokenSelectContainer $pageCentered={isPageCentered ?? false}>
      <Header title={<Trans>Select token</Trans>} />
      <Column gap={0.75}>
        <Column gap={0.75} style={{ margin: '0 0.5rem' }}>
          <Row pad={0.75} grow>
            <SearchInputContainer gap={0.75} justify="start" flex>
              <Search color="secondary" />
              <ThemedText.Body1 flexGrow={1}>
                <StringInput
                  value={query}
                  onChange={setQuery}
                  placeholder={t`Search by token name or address`}
                  onKeyDown={options?.onKeyDown}
                  ref={input}
                />
              </ThemedText.Body1>
            </SearchInputContainer>
          </Row>
          <CommonBases chainId={chainId} onSelect={onSelect} selected={value} />
        </Column>
        <Rule padded />
      </Column>
      {isLoaded ? (
        tokens.length ? (
          <TokenOptions tokens={tokens} onSelect={onSelect} ref={setOptions} />
        ) : (
          <Column padded>
            <Row justify="center">
              <ThemedText.Body1 color="secondary">
                <Trans>No results found.</Trans>
              </ThemedText.Body1>
            </Row>
          </Column>
        )
      ) : (
        <TokenOptionsSkeleton />
      )}
    </TokenSelectContainer>
  )
}

interface TokenSelectProps {
  field: Field
  value?: Currency
  approved?: boolean
  disabled?: boolean
  onSelect: (value: Currency) => void
}

export default memo(function TokenSelect({ field, value, approved, disabled, onSelect }: TokenSelectProps) {
  usePrefetchBalances()

  const [open, setOpen] = useState(false)
  const onTokenSelectorClick = useConditionalHandler(useAtomValue(swapEventHandlersAtom).onTokenSelectorClick)
  const onOpen = useCallback(async () => {
    setOpen(await onTokenSelectorClick(field))
  }, [field, onTokenSelectorClick])
  const selectAndClose = useCallback(
    (value: Currency) => {
      onSelect(value)
      setOpen(false)
    },
    [onSelect, setOpen]
  )

  return (
    <>
      <TokenButton value={value} approved={approved} disabled={disabled} onClick={onOpen} />
      <ResponsiveDialog open={open} setOpen={setOpen}>
        <TokenSelectDialogContent value={value} onSelect={selectAndClose} onClose={() => setOpen(false)} />
      </ResponsiveDialog>
    </>
  )
})
