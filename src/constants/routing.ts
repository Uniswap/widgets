// a list of tokens by chain
import { ChainId, NativeCurrency, Token } from '@uniswap/sdk-core'

import {
  AMPL,
  CEUR_CELO,
  CMC02_CELO,
  CUSD_CELO,
  DAI,
  DAI_ARBITRUM_ONE,
  DAI_OPTIMISM,
  DAI_POLYGON,
  ETH2X_FLI,
  FEI,
  FRAX,
  FXS,
  nativeOnChain,
  PORTAL_ETH_CELO,
  PORTAL_USDC_CELO,
  renBTC,
  rETH2,
  sETH2,
  SWISE,
  TRIBE,
  USDC_BASE,
  USDC_BNB_CHAIN,
  USDC_MAINNET,
  USDC_POLYGON,
  USDT,
  USDT_ARBITRUM_ONE,
  USDT_BNB_CHAIN,
  USDT_OPTIMISM,
  USDT_POLYGON,
  WBTC,
  WBTC_ARBITRUM_ONE,
  WBTC_OPTIMISM,
  WETH_POLYGON,
  WRAPPED_NATIVE_CURRENCY,
} from './tokens'

type ChainTokenList = {
  readonly [chainId: number]: Array<Token | NativeCurrency>
}

const WRAPPED_NATIVE_CURRENCIES_ONLY: ChainTokenList = Object.fromEntries(
  Object.entries(WRAPPED_NATIVE_CURRENCY)
    .map(([key, value]) => [key, [value]])
    .filter(Boolean)
)

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WRAPPED_NATIVE_CURRENCIES_ONLY,
  [ChainId.MAINNET]: [
    nativeOnChain(ChainId.MAINNET),
    DAI,
    USDC_MAINNET,
    USDT,
    WBTC,
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.MAINNET],
  ],
  [ChainId.OPTIMISM]: [...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.OPTIMISM], DAI_OPTIMISM, USDT_OPTIMISM, WBTC_OPTIMISM],
  [ChainId.ARBITRUM_ONE]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.ARBITRUM_ONE],
    DAI_ARBITRUM_ONE,
    USDT_ARBITRUM_ONE,
    WBTC_ARBITRUM_ONE,
  ],
  [ChainId.POLYGON]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.POLYGON],
    DAI_POLYGON,
    USDC_POLYGON,
    USDT_POLYGON,
    WETH_POLYGON,
  ],
  [ChainId.CELO]: [
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.CELO],
    CUSD_CELO,
    CEUR_CELO,
    CMC02_CELO,
    PORTAL_USDC_CELO,
    PORTAL_ETH_CELO,
  ],
  [ChainId.BNB]: [
    nativeOnChain(ChainId.BNB),
    USDC_BNB_CHAIN,
    USDT_BNB_CHAIN,
    ...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.BNB],
  ],
  [ChainId.BASE]: [nativeOnChain(ChainId.BASE), USDC_BASE, ...WRAPPED_NATIVE_CURRENCIES_ONLY[ChainId.BASE]],
}
export const ADDITIONAL_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    '0xF16E4d813f4DcfDe4c5b44f305c908742De84eF0': [ETH2X_FLI],
    [rETH2.address]: [sETH2],
    [SWISE.address]: [sETH2],
    [FEI.address]: [TRIBE],
    [TRIBE.address]: [FEI],
    [FRAX.address]: [FXS],
    [FXS.address]: [FRAX],
    [WBTC.address]: [renBTC],
    [renBTC.address]: [WBTC],
  },
}
/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    [AMPL.address]: [DAI, WRAPPED_NATIVE_CURRENCY[ChainId.MAINNET] as Token],
  },
}
