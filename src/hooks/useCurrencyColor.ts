import { Currency } from '@uniswap/sdk-core'
import { useTokenLogoTableEntry } from 'components/Logo/hooks'
import { SupportedChainId } from 'constants/chains'
import Vibrant from 'node-vibrant/lib/bundle.js'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'styled-components/macro'

import useCurrencyLogoURIs from './useCurrencyLogoURIs'

const colors = new Map<string, string | undefined>()

/**
 * Extracts the prominent color from a token.
 * NB: If cached, this function returns synchronously; using a callback allows sync or async returns.
 */
async function getColorFromLogoURIs(logoURIs: string[], cb: (color: string | undefined) => void = () => void 0) {
  const key = logoURIs[0]
  let color = colors.get(key)

  if (!color) {
    for (const logoURI of logoURIs) {
      let uri = logoURI
      if (logoURI.startsWith('http')) {
        // Color extraction must use a CORS-compatible resource, but the resource may already be cached.
        // Adds a dummy parameter to force a different browser resource cache entry. Without this, color extraction prevents resource caching.
        uri += '?color'
      }

      color = await getColorFromUriPath(uri)
      if (color) break
    }
  }

  colors.set(key, color)
  return cb(color)
}

async function getColorFromUriPath(uri: string): Promise<string | undefined> {
  try {
    const palette = await Vibrant.from(uri).getPalette()
    return palette.Vibrant?.hex
  } catch {}
  return
}

export function usePrefetchCurrencyColor(token?: Currency) {
  const theme = useTheme()
  const logoURIs = useCurrencyLogoURIs(token)

  useEffect(() => {
    if (theme.tokenColorExtraction && token) {
      getColorFromLogoURIs(logoURIs)
    }
  }, [token, logoURIs, theme.tokenColorExtraction])
}

export default function useCurrencyColor(currency?: Currency) {
  const [color, setColor] = useState<string | undefined>(undefined)
  const theme = useTheme()
  const entry = useTokenLogoTableEntry(currency?.wrapped.address, currency?.wrapped.chainId ?? SupportedChainId.MAINNET)
  const logoURIs = useMemo(() => entry?.getAllUris() ?? [], [entry])
  useEffect(() => {
    let stale = false

    if (theme.tokenColorExtraction && currency) {
      getColorFromLogoURIs(logoURIs, (color) => {
        if (!stale && color) {
          setColor(color)
        }
      })
    }

    return () => {
      stale = true
      setColor(undefined)
    }
  }, [currency, logoURIs, theme.tokenColorExtraction])

  return color
}
