import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { CUSD_CELO, DAI_OPTIMISM, USDC_ARBITRUM, USDC_MAINNET, USDC_POLYGON } from 'constants/tokens'
import { useMemo } from 'react'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'

// Stablecoin amounts used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
export const STABLECOIN_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Token> } = {
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC_MAINNET, 100_000e6),
  [SupportedChainId.ARBITRUM_ONE]: CurrencyAmount.fromRawAmount(USDC_ARBITRUM, 10_000e6),
  [SupportedChainId.OPTIMISM]: CurrencyAmount.fromRawAmount(DAI_OPTIMISM, 10_000e18),
  [SupportedChainId.POLYGON]: CurrencyAmount.fromRawAmount(USDC_POLYGON, 10_000e6),
  [SupportedChainId.CELO]: CurrencyAmount.fromRawAmount(CUSD_CELO, 10_000e18),
}

/**
 *
 * @param fiatValue string representation of a USD amount
 * @returns CurrencyAmount where currency is stablecoin on active chain
 */
export function useStablecoinAmountFromFiatValue(fiatValue: string | null | undefined) {
  const { chainId } = useWeb3React()
  const stablecoin = chainId ? STABLECOIN_AMOUNT_OUT[chainId]?.currency : undefined

  return useMemo(() => {
    if (fiatValue === null || fiatValue === undefined || !chainId || !stablecoin) {
      return undefined
    }

    // trim for decimal precision when parsing
    const parsedForDecimals = parseFloat(fiatValue).toFixed(stablecoin.decimals).toString()
    try {
      // parse USD string into CurrencyAmount based on stablecoin decimals
      return tryParseCurrencyAmount(parsedForDecimals, stablecoin)
    } catch (error) {
      return undefined
    }
  }, [chainId, fiatValue, stablecoin])
}
