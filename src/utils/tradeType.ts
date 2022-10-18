import { TradeType } from '@uniswap/sdk-core'
import { Field } from 'state/swap'

export function isExactInput(tradeType: TradeType): boolean {
  return tradeType === TradeType.EXACT_INPUT
}

export function invertTradeType(tradeType: TradeType): TradeType {
  switch (tradeType) {
    case TradeType.EXACT_INPUT:
      return TradeType.EXACT_OUTPUT
    case TradeType.EXACT_OUTPUT:
      return TradeType.EXACT_INPUT
  }
}

export function toTradeType(modifiedField: Field): TradeType {
  switch (modifiedField) {
    case Field.INPUT:
      return TradeType.EXACT_INPUT
    case Field.OUTPUT:
      return TradeType.EXACT_OUTPUT
  }
}
