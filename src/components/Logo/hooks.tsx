import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'

import { TokenEntry, TokenLogoLookupTable } from './LogoTable'
import { getNativeLogoURI } from './util'

const table = TokenLogoLookupTable.getInstance()
const TokenLogoProviderContext = createContext<TokenLogoLookupTable>(table)

export function Provider({ children, tokens }: PropsWithChildren<{ tokens: WrappedTokenInfo[] }>) {
  const isFirstRender = useRef(true)

  if (isFirstRender.current) {
    table.initialize(tokens)
    isFirstRender.current = false
  }

  useEffect(() => {
    table.initialize(tokens)
  }, [tokens])

  return <TokenLogoProviderContext.Provider value={table}>{children}</TokenLogoProviderContext.Provider>
}

export function useTokenLogoTable() {
  const table = useContext(TokenLogoProviderContext)
  if (!table?.isInitialized()) throw new Error('Token Logo hooks must be wrapped in a <TokenLogoProvider>')
  return table
}

export function useTokenLogoTableEntry(address: string | null | undefined, chainId: number): TokenEntry | undefined {
  const table = useTokenLogoTable()
  return useMemo(() => table.getEntry(address, chainId), [address, chainId, table])
}

export function useTokenLogoSrcs(address: string | null | undefined, chainId: number, isNative = false) {
  const entry = useTokenLogoTableEntry(address, chainId)
  const [current, setCurrent] = useState<string | undefined>(entry?.getSrc()?.getUri())

  const invalidateSrc = useCallback(() => {
    entry?.invalidateSrc()
    setCurrent(entry?.getSrc()?.getUri())
  }, [entry])

  if (isNative) return { src: getNativeLogoURI(chainId) }

  return { src: current, invalidateSrc }
}
