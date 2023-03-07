export enum RouterPreference {
  API = 'api',
  CLIENT = 'client',
}

export enum QuoteType {
  TRADE = 'trade',
  PRICE = 'price',
  SKIP = 'skip',
}

export type QuoteConfig =
  | { type: QuoteType.TRADE; preference: RouterPreference }
  | { type: QuoteType.PRICE; preference: RouterPreference }
  | { type: QuoteType.SKIP }

export enum PoolType {
  V2Pool = 'v2-pool',
  V3Pool = 'v3-pool',
}

// swap router API special cases these strings to represent native currencies
// all chains have "ETH" as native currency symbol except for polygon
export enum SwapRouterNativeAssets {
  MATIC = 'MATIC',
  ETH = 'ETH',
}
