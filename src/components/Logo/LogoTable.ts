import uriToHttp from 'utils/uriToHttp'

import { getAssetsRepoURI, getNativeLogoURI } from './util'

export type LogoTableInput = { address?: string | null; chainId: number; isNative?: boolean; logoURI?: string }

abstract class LogoSrc {
  abstract key: string
  abstract getUri: () => string | undefined
  abstract useAlternateUri?: () => string | undefined
}

class UriSrc implements LogoSrc {
  key: string
  protected parsedUri: string | undefined | null = null
  protected unparsedUri: string
  private alternateUri: string | undefined

  constructor(uri: string) {
    this.key = uri
    this.unparsedUri = uri
  }

  getUri() {
    // Lazy-parse the address
    if (this.parsedUri === null) {
      ;[this.parsedUri, this.alternateUri] = uriToHttp(this.unparsedUri)
    }
    return this.parsedUri
  }

  useAlternateUri() {
    this.parsedUri = this.alternateUri
    delete this.alternateUri

    return this.parsedUri
  }
}

class CoingeckoSrc extends UriSrc {
  getUri() {
    // Lazy-parse coingecko Url
    if (this.parsedUri === null) {
      this.parsedUri = this.unparsedUri.replace(/small|thumb/g, 'large')
    }
    return this.parsedUri
  }
}

class AssetsRepoSrc implements LogoSrc {
  key: string
  private uri: string | undefined | null = null
  private asset: LogoTableInput

  constructor(asset: LogoTableInput) {
    this.key = `UNI-AR-${asset.address?.toLowerCase()}:${asset.chainId}`
    this.asset = asset
  }

  getUri() {
    // Lazy-builds assets repo address since it uses checksum
    if (this.uri === null) {
      this.uri = getAssetsRepoURI(this.asset)
    }
    return this.uri
  }
}

const getKey = ({ address, chainId }: LogoTableInput) => `${address?.toLowerCase()}:${chainId}`

/** Contains all sources for a specific asset */
export class LogoStore {
  private srcs: { [key: string]: LogoSrc | undefined } = {}
  private keys: string[] = []

  constructor(asset: LogoTableInput) {
    if (asset.isNative) this.addUri(getNativeLogoURI(asset.chainId))

    this.addSrc(new AssetsRepoSrc(asset))
    if (asset.logoURI) this.addUri(asset.logoURI)
  }

  addSrc(newSrc: LogoSrc) {
    if (this.srcs[newSrc.key]) return
    this.srcs[newSrc.key] = newSrc
    this.keys.push(newSrc.key)
  }

  addUri(uri: string) {
    if (this.srcs[uri]) return
    this.addSrc(uri.startsWith('https://assets.coingecko') ? new CoingeckoSrc(uri) : new UriSrc(uri))
  }

  /** Invalidates the current src and returns the new current source if available */
  invalidateSrc() {
    const currentSrc = this.getCurrent()
    if (!currentSrc) return

    // Use a source's alternative uri if available before marking invalid
    if (currentSrc.useAlternateUri?.()) {
      return currentSrc
    } else {
      delete this.srcs[currentSrc.key]
      this.keys.shift()

      return this.getCurrent()
    }
  }

  getAllUris() {
    return this.keys.map((key) => this.srcs[key]?.getUri()).filter((uri) => !!uri) as string[]
  }

  getCurrent() {
    if (this.keys.length === 0) return
    return this.srcs[this.keys[0]]
  }
}

type KeyStoreMap = { [key: string]: LogoStore | undefined }
export class LogoTable {
  private map: KeyStoreMap = {}
  private initialized = false
  private static instance: LogoTable

  /** Implements Singleton pattern to keep one source of logos */
  public static getInstance(): LogoTable {
    if (!LogoTable.instance) {
      LogoTable.instance = new LogoTable()
    }
    return LogoTable.instance
  }

  private constructor() {
    if (!!LogoTable.instance) throw new Error('Cannot instantiate multiple multiple logo tables')
  }

  /** Adds a new asset to the table and returns the newly added entry  */
  addToTable(asset: LogoTableInput) {
    const key = getKey(asset)
    let currentEntry = this.map[key]
    if (currentEntry) {
      asset.logoURI && currentEntry.addUri(asset.logoURI)
    } else {
      currentEntry = new LogoStore(asset)
      this.map[key] = currentEntry
    }
    return currentEntry
  }

  initialize(tokens: LogoTableInput[]) {
    tokens.forEach((asset) => this.addToTable(asset))
    this.initialized = true
  }

  isInitialized() {
    return this.initialized
  }

  getEntry(asset: LogoTableInput | undefined) {
    if (!asset) return undefined
    return this.map[getKey(asset)] ?? this.addToTable(asset)
  }
}
