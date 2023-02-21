import { useCallback, useEffect, useMemo, useRef } from 'react'

import { LogoTable, LogoTableInput } from './LogoTable'
const table = LogoTable.getInstance()

/** An optional component to update table with logos as sources change */
export function LogoUpdater({ assets }: { assets: LogoTableInput[] }) {
  const isFirstRender = useRef(true)

  if (isFirstRender.current) {
    table.initialize(assets)
    isFirstRender.current = false
  }

  useEffect(() => {
    table.initialize(assets)
  }, [assets])

  return null
}

export function useLogos(currency: LogoTableInput | undefined): string[] | undefined {
  return useMemo(() => table.getEntry(currency)?.getAllUris(), [currency])
}

export function useLogo(currency: LogoTableInput | undefined) {
  const entry = useMemo(() => table.getEntry(currency), [currency])

  const src = useMemo(() => entry?.getCurrent()?.getUri(), [entry])

  const invalidateSrc = useCallback(() => {
    entry?.invalidateSrc()
  }, [entry])

  return { src, invalidateSrc }
}
