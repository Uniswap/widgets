import defaultTokenList from '@uniswap/default-token-list'
import { TokenList } from '@uniswap/token-lists'

class TokenLogoLookupTable {
  private dict: { [key: string]: string[] | undefined } = {}
  private initialized = false

  initialize(lists: TokenList[]) {
    const dict: { [key: string]: string[] | undefined } = {}

    lists.forEach((list) =>
      list.tokens.forEach((token) => {
        if (token.logoURI) {
          const lowercaseAddress = token.address.toLowerCase()
          const currentEntry = dict[lowercaseAddress + ':' + token.chainId]
          if (currentEntry) {
            currentEntry.push(token.logoURI)
          } else {
            dict[lowercaseAddress + ':' + token.chainId] = [token.logoURI]
          }
        }
      })
    )
    this.dict = dict
    this.initialized = true
  }
  getIcons(address?: string | null, chainId: number | null = 1) {
    if (!address) return undefined

    if (!this.initialized) {
      this.initialize([defaultTokenList])
    }

    return this.dict[address.toLowerCase() + ':' + chainId]
  }
}

export default new TokenLogoLookupTable()
