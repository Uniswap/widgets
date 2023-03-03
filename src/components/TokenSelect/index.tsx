import { t, Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { inputCss, StringInput } from 'components/Input'
import { useConditionalHandler } from 'hooks/useConditionalHandler'
import { useCurrencyBalances } from 'hooks/useCurrencyBalance'
import { useNativeCurrencies } from 'hooks/useNativeCurrency'
import { useEvmAccountAddress } from 'hooks/useSyncWidgetSettings'
import useTokenList, { useIsTokenListLoaded, useQueryTokens } from 'hooks/useTokenList'
import { Search } from 'icons'
import { useAtomValue } from 'jotai/utils'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Field, swapEventHandlersAtom } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Column from '../Column'
import Dialog, { Header } from '../Dialog'
import Row from '../Row'
import Rule from '../Rule'
import ChainFilter from './ChainFilter'
import TokenButton from './TokenButton'
import TokenOptions, { TokenOptionsHandle } from './TokenOptions'
import TokenOptionsSkeleton from './TokenOptionsSkeleton'

const SearchInputContainer = styled(Row)`
  ${inputCss}
`

function usePrefetchBalances() {
  const tokenList = useTokenList()
  const prefetchedTokenList = useRef<typeof tokenList>()
  useCurrencyBalances(tokenList !== prefetchedTokenList.current ? tokenList : undefined)
  prefetchedTokenList.current = tokenList
}

function useAreBalancesLoaded(): boolean {
  const account = useEvmAccountAddress()
  const tokens = useTokenList()
  const nativeTokens = useNativeCurrencies()
  const currencies = useMemo(() => [...nativeTokens, ...tokens], [nativeTokens, tokens])
  const balances = useCurrencyBalances(currencies).filter(Boolean)
  return !account || currencies.length === balances.length
}

interface TokenSelectDialogProps {
  value?: Currency
  onSelect: (token: Currency) => void
  onClose: () => void
  chainIdsAllowed?: number[]
  protocolsAllowed?: string[]
}

export function TokenSelectDialog({
  value,
  onSelect,
  onClose,
  chainIdsAllowed,
  protocolsAllowed,
}: TokenSelectDialogProps) {
  const [query, setQuery] = useState('')
  const [chainIdFilter, setChainIdFilter] = useState<number | undefined>()
  const allChainList = useTokenList()
  const list = useMemo(() => {
    let chainFilteredList = []
    if (!chainIdFilter) {
      if (chainIdsAllowed && Array.isArray(chainIdsAllowed)) {
        chainFilteredList = allChainList.filter((x) => chainIdsAllowed.includes(x.chainId))
      } else {
        chainFilteredList = allChainList
      }
    } else {
      chainFilteredList = allChainList.filter((x) => x.chainId === chainIdFilter)
    }

    if (Array.isArray(protocolsAllowed)) {
      return chainFilteredList.filter((x) => protocolsAllowed.includes((x as any).protocol ?? 'unknown'))
    }

    return chainFilteredList
  }, [allChainList, chainIdFilter, chainIdsAllowed, protocolsAllowed])

  const tokens = useQueryTokens(query, list)

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

  return (
    <Dialog color="container" onClose={onClose}>
      <Header title={<Trans>Select token</Trans>} />
      <Column gap={0.75}>
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
        <ChainFilter selected={chainIdFilter} onSelect={setChainIdFilter} chainIdsAllowed={chainIdsAllowed} />
        {/* <CommonBases chainId={chainId} onSelect={onSelect} selected={value} /> */}
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
    </Dialog>
  )
}

interface TokenSelectProps {
  field: Field
  value?: Currency
  approved?: boolean
  disabled?: boolean
  onSelect: (value: Currency) => void
  chainIdsAllowed?: number[]
  presetValue?: boolean
  protocolsAllowed?: string[]
}

export default memo(function TokenSelect({
  field,
  value,
  approved,
  disabled,
  onSelect,
  chainIdsAllowed,
  presetValue,
  protocolsAllowed,
}: TokenSelectProps) {
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
      <TokenButton value={value} approved={approved} disabled={disabled} presetValue={presetValue} onClick={onOpen} />
      {open && (
        <TokenSelectDialog
          value={value}
          onSelect={selectAndClose}
          onClose={() => setOpen(false)}
          chainIdsAllowed={chainIdsAllowed}
          protocolsAllowed={protocolsAllowed}
        />
      )}
    </>
  )
})
