import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { DEFAULT_LOCALE } from 'constants/locales'

// Convert [CurrencyAmount] to number with necessary precision for price formatting.
export function currencyAmountToPreciseFloat(currencyAmount: CurrencyAmount<Currency> | undefined) {
  if (!currencyAmount) return undefined
  const floatForLargerNumbers = parseFloat(currencyAmount.toExact())
  if (floatForLargerNumbers < 0.1) {
    return parseFloat(currencyAmount.toSignificant(6))
  }
  return floatForLargerNumbers
}

// Convert [Price] to number with necessary precision for price formatting.
export function priceToPreciseFloat(price: Price<Currency, Currency> | undefined) {
  if (!price) return undefined
  const floatForLargerNumbers = parseFloat(price.toFixed(9))
  if (floatForLargerNumbers < 0.1) {
    return parseFloat(price.toSignificant(6))
  }
  return floatForLargerNumbers
}

interface FormatDollarArgs {
  num: number | undefined | null
  lessPreciseStablecoinValues?: boolean
}

// For USD or USD equivalent denominated values.
export function formatDollar({ num, lessPreciseStablecoinValues = false }: FormatDollarArgs): string {
  if (num === 0) return '$0.00'
  if (!num) return '-'
  if (num < 0.000001) {
    return `$${num.toExponential(2)}`
  }
  if ((num >= 0.000001 && num < 0.1) || num > 1000000) {
    return `$${Number(num).toPrecision(3)}`
  }
  if (num >= 0.1 && num < (lessPreciseStablecoinValues ? 0.9995 : 1.05)) {
    return `$${num.toFixed(3)}`
  }
  return `$${Number(num.toFixed(2)).toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2 })}`
}

export function formatTransactionAmount(num: number | undefined | null, maxDigits = 9) {
  if (num === 0) return '0.00'
  if (!num) return ''
  if (num < 0.00001) {
    return '<0.00001'
  }
  if (num >= 0.00001 && num < 1) {
    return `${Number(num.toFixed(5)).toLocaleString(DEFAULT_LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    })}`
  }
  if (num >= 1 && num < 10000) {
    return `${Number(num.toPrecision(6)).toLocaleString(DEFAULT_LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })}`
  }
  if (num >= 10000 && num < 1000000) {
    return `${Number(num.toFixed(2)).toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2 })}`
  }
  // For very large numbers, switch to scientific notation and show as much precision
  // as permissible by maxDigits param.
  if (num >= Math.pow(10, maxDigits - 1)) {
    return `${num.toExponential(maxDigits - 3)}`
  }
  return `${Number(num.toFixed(2)).toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2 })}`
}
