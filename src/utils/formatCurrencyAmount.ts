import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import {
  currencyAmountToPreciseFloat,
  formatDollar,
  formatTransactionAmount,
  priceToPreciseFloat,
} from './formatNumbers'

export function formatCurrencyAmount(amount: CurrencyAmount<Currency> | undefined, isUsdPrice = false): string {
  const currencyAmountNumber = currencyAmountToPreciseFloat(amount)
  return isUsdPrice ? formatDollar({ num: currencyAmountNumber }) : formatTransactionAmount(currencyAmountNumber)
}

export function formatPrice(price: Price<Currency, Currency> | undefined): string {
  return formatTransactionAmount(priceToPreciseFloat(price))
}
