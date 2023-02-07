import { Currency } from '@uniswap/sdk-core'

export function currencyId(currency: Currency): string {
  if (currency.isNative) return `${currency.chainId}_NATIVE`
  if (currency.isToken) return `${currency.chainId}_${currency.address}`
  throw new Error('invalid currency')
}
