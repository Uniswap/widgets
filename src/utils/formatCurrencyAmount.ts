import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import {
  currencyAmountToPreciseFloat,
  formatDollar,
  formatTransactionAmount,
  priceToPreciseFloat,
} from './formatNumbers'

interface FormatCurrencyAmountArgs {
  amount: CurrencyAmount<Currency> | undefined
  isUsdPrice?: boolean
}

/**
 * Returns currency amount formatted as a human readable string.
 * @param amount currency amount
 * @param isUsdPrice whether the amount is denominated in USD or USD equivalent
 */
export function formatCurrencyAmount({ amount, isUsdPrice = false }: FormatCurrencyAmountArgs): string {
  if (!amount) return ''
  const currencyAmountNumber = currencyAmountToPreciseFloat(amount)
  return isUsdPrice ? formatDollar({ num: currencyAmountNumber }) : formatTransactionAmount(currencyAmountNumber)
}

/**
 * Returns price formatted as a human readable string.
 * @param price price
 */
export function formatPrice(price: Price<Currency, Currency> | undefined): string {
  return formatTransactionAmount(priceToPreciseFloat(price))
}
