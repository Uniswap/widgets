import { SupportedChainId } from 'constants/chains'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { isAddress } from 'utils'

import { chainIdToNetworkName } from './util'

interface TokenLogoSrc {
  key: string
  getUri: () => string | undefined
  getAlternateUri?: () => string | undefined
}

class UriSrc implements TokenLogoSrc {
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
      const protocol = this.unparsedUri.split(':')[0].toLowerCase()
      switch (protocol) {
        case 'http':
          this.parsedUri = 'https' + this.unparsedUri.substr(4)
          this.alternateUri = this.unparsedUri
          break
        case 'ipfs': {
          const hash = this.unparsedUri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2]
          this.parsedUri = `https://cloudflare-ipfs.com/ipfs/${hash}/`
          this.alternateUri = `https://ipfs.io/ipfs/${hash}/`
          break
        }
        case 'ipns': {
          const name = this.unparsedUri.match(/^ipns:(\/\/)?(.*)$/i)?.[2]
          this.parsedUri = `https://cloudflare-ipfs.com/ipns/${name}/`
          this.alternateUri = `https://ipfs.io/ipns/${name}/`
          break
        }
        case 'ar': {
          const tx = this.unparsedUri.match(/^ar:(\/\/)?(.*)$/i)?.[2]
          this.parsedUri = `https://arweave.net/${tx}`
          break
        }
        case 'data':
        case 'https':
          this.parsedUri = this.unparsedUri
          break
        default:
          this.parsedUri = undefined
          break
      }
    }
    return this.parsedUri
  }

  getAlternateUri() {
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

class AssetsRepoSrc implements TokenLogoSrc {
  key: string
  private uri: string | undefined | null = null
  private address: string
  private chainId: number

  constructor(address: string, chainId: number) {
    this.key = `UNI-AR-${address}:${chainId}`
    this.address = address
    this.chainId = chainId
  }

  getUri() {
    // Lazy-checksum
    if (this.uri === null) {
      const networkName = chainIdToNetworkName(this.chainId)
      const checksummedAddress = isAddress(this.address)
      if (checksummedAddress && networkName) {
        this.uri = `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${networkName}/assets/${checksummedAddress}/logo.png`
      } else {
        this.uri = undefined
      }
    }
    return this.uri
  }
}

const createKey = ({ address, chainId }: { address: string; chainId: number }) => `${address.toLowerCase()}:${chainId}`

export class TokenEntry {
  private srcs: { [key: string]: TokenLogoSrc | undefined } = {}
  private keys: string[]
  private currentSrc: TokenLogoSrc | undefined

  constructor(address: string, chainId: number, uri?: string) {
    const assetsRepoSrc = new AssetsRepoSrc(address, chainId)
    this.keys = [assetsRepoSrc.key]
    this.srcs[assetsRepoSrc.key] = assetsRepoSrc
    if (!!uri) this.addSrc(uri)

    this.currentSrc = assetsRepoSrc
  }

  invalidateSrc() {
    const alternateUri = this.currentSrc?.getAlternateUri?.()

    if (!alternateUri) {
      const prevKey = this.keys.shift()
      if (prevKey) delete this.srcs[prevKey]

      this.currentSrc = this.srcs[this.keys[0]]
    }
  }

  getAllUris() {
    return this.keys.map((key) => this.srcs[key]?.getUri()).filter((uri) => !!uri) as string[]
  }

  getSrc() {
    return this.currentSrc
  }

  addSrc(uri: string) {
    if (this.srcs[uri]) return

    const uriSrc = uri.startsWith('https://assets.coingecko') ? new CoingeckoSrc(uri) : new UriSrc(uri)
    this.srcs[uriSrc.key] = uriSrc
    this.keys.push(uriSrc.key)
  }
}

type KeyTokenEntryMap = { [key: string]: TokenEntry | undefined }
export class TokenLogoLookupTable {
  private map: KeyTokenEntryMap = {}
  private initialized = false
  private static instance: TokenLogoLookupTable

  // Implements Singleton pattern to keep one source of logos
  public static getInstance(): TokenLogoLookupTable {
    if (!TokenLogoLookupTable.instance) {
      TokenLogoLookupTable.instance = new TokenLogoLookupTable()
    }
    return TokenLogoLookupTable.instance
  }

  private constructor() {
    if (!!TokenLogoLookupTable.instance) throw new Error('Cannot instantiate multiple multiple logo tables')
  }

  addTokensToMap(tokens: WrappedTokenInfo[]) {
    tokens.forEach((token) => {
      if (token.logoURI) {
        const key = createKey(token)
        const currentEntry = this.map[key]
        if (currentEntry) {
          currentEntry.addSrc(token.logoURI)
        } else {
          this.map[key] = new TokenEntry(token.address, token.chainId, token.logoURI)
        }
      }
    })
  }

  initialize(tokens: WrappedTokenInfo[]) {
    this.addTokensToMap(tokens)
    this.initialized = true
  }

  isInitialized() {
    return this.initialized
  }

  getEntry(address?: string | null, chainId: number = SupportedChainId.MAINNET) {
    if (!address || !this.initialized) return undefined

    const entry = this.map[createKey({ address, chainId })]
    return entry
  }
}
