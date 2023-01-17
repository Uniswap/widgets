import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { FeeAmount, Pool, Route as RouteV3 } from '@uniswap/v3-sdk'

// helper function to make amounts more readable
export const amount = (raw: TemplateStringsArray) => (parseInt(raw[0]) * 1e6).toString()

export const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC')
export const DAI = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 6, 'DAI')
export const MKR = new Token(1, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 6, 'MKR')

type V3Route<In extends Token, Out extends Token> = {
  routev3: RouteV3<In, Out>
  inputAmount: CurrencyAmount<In>
  outputAmount: CurrencyAmount<Out>
}

export function buildSingleV3Route<In extends Token, Out extends Token>(
  inputAmount: CurrencyAmount<In>,
  outputAmount: CurrencyAmount<Out>
): V3Route<In, Out> {
  return {
    routev3: new RouteV3(
      [buildV3Pool(inputAmount.currency, outputAmount.currency)],
      inputAmount.currency,
      outputAmount.currency
    ),
    inputAmount,
    outputAmount,
  }
}

export function buildMultiV3Route<In extends Token, Out extends Token>(
  inputAmount: CurrencyAmount<In>,
  outputAmount: CurrencyAmount<Out>
): V3Route<In, Out> {
  return {
    routev3: new RouteV3(
      [buildV3Pool(inputAmount.currency, MKR), buildV3Pool(MKR, outputAmount.currency)],
      inputAmount.currency,
      outputAmount.currency
    ),
    inputAmount,
    outputAmount,
  }
}

export function buildV3Pool(tokenA: Token, tokenB: Token): Pool {
  return new Pool(tokenA, tokenB, FeeAmount.MEDIUM, '2437312313659959819381354528', '10272714736694327408', -69633)
}
