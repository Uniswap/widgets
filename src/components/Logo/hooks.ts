import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

  const [src, setSrc] = useState(entry?.getCurrent()?.getUri())
  useEffect(() => {
    setSrc(entry?.getCurrent()?.getUri())
  }, [currency, entry])

  const invalidateSrc = useCallback(() => {
    const nextSrc = entry?.invalidateSrc()
    setSrc(nextSrc?.getUri())
  }, [entry])

  return { src, invalidateSrc }
}
