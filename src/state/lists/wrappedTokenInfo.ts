import { Currency, Token } from '@uniswap/sdk-core'
import { Tags, TokenInfo } from '@uniswap/token-lists'

type TagDetails = Tags[keyof Tags]
interface TagInfo extends TagDetails {
  id: string
}

type AugmentedTokenInfo = TokenInfo & {
  protocol?: string
}
/**
 * Token instances created from token info on a token list.
 */
export class WrappedTokenInfo implements Token {
  public readonly isNative: false = false
  public readonly isToken: true = true
  public readonly tokenInfo: AugmentedTokenInfo

  constructor(tokenInfo: AugmentedTokenInfo) {
    this.tokenInfo = tokenInfo
  }

  private _checksummedAddress: string | null = null

  public get address(): string {
    return this.tokenInfo.address
    // if (this._checksummedAddress) return this._checksummedAddress
    // const checksummedAddress = isAddress(this.tokenInfo.address)
    // if (!checksummedAddress) throw new Error(`Invalid token address: ${this.tokenInfo.address}`)
    // return (this._checksummedAddress = checksummedAddress)
  }

  public get chainId(): number {
    return this.tokenInfo.chainId
  }

  public get decimals(): number {
    return this.tokenInfo.decimals
  }

  public get name(): string {
    return this.tokenInfo.name
  }

  public get symbol(): string {
    return this.tokenInfo.symbol
  }

  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI
  }

  public get protocol(): string | undefined {
    return this.tokenInfo.protocol
  }

  private _tags: TagInfo[] | null = null
  public get tags(): TagInfo[] {
    return []
  }

  equals(other: Currency): boolean {
    return other.chainId === this.chainId && other.isToken && other.address.toLowerCase() === this.address.toLowerCase()
  }

  sortsBefore(other: Token): boolean {
    if (this.equals(other)) throw new Error('Addresses should not be equal')
    return this.address.toLowerCase() < other.address.toLowerCase()
  }

  public get wrapped(): Token {
    return this
  }
}
