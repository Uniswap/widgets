import { renderHook } from '@testing-library/react-hooks'
import { CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { DAI, USDC_MAINNET } from 'constants/tokens'
import { GetQuoteResult, TradeState, V3PoolInRoute } from 'state/routing/types'

import { getClientSideQuote, isAutoRouterSupportedChain } from './clientSideSmartOrderRouter'
import { useRouterTrade } from './useRouterTrade'
import { getRouterApiQuote, QuoteArguments } from 'state/routing/slice'

import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { Trade } from 'components/Swap/Toolbar/Caption'
import { AlphaRouterConfig } from '@uniswap/smart-order-router'

const ROUTER_URL = 'https://api.uniswap.org/v1/'

const USDCAmount = CurrencyAmount.fromRawAmount(USDC_MAINNET, '10000')
const DAIAmount = CurrencyAmount.fromRawAmount(DAI, '10000')

jest.mock('./clientSideSmartOrderRouter')
jest.mock('./useRouterTrade')
jest.mock('hooks/useDebounce')
jest.mock('hooks/useIsWindowVisible')
jest.mock('state/')

const mockUseDebounce = useDebounce as jest.MockedFunction<typeof useDebounce>
const mockIsAutoRouterSupportedChain = isAutoRouterSupportedChain as jest.MockedFunction<
  typeof isAutoRouterSupportedChain
>
const mockUseIsWindowVisible = useIsWindowVisible as jest.MockedFunction<typeof useIsWindowVisible>

const mockGetRouterApiQuote = getRouterApiQuote as unknown as jest.MockInstance<
  Promise<{ data: GetQuoteResult; error?: unknown }>,
  [QuoteArguments, Partial<AlphaRouterConfig>]
>
const mockGetClientSideQuote = getClientSideQuote as unknown as jest.MockInstance<
  Promise<{ data: GetQuoteResult; error?: unknown }>,
  [QuoteArguments, Partial<AlphaRouterConfig>]
>

const v3route: V3PoolInRoute[] = [
  {
    address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
    amountIn: '1000000000000000000',
    fee: '500',
    liquidity: '12738581417618102003',
    sqrtRatioX96: '1971139529273279426574580565311255',
    tickCurrent: '202445',
    tokenIn: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      chainId: 1,
      decimals: 18,
      symbol: 'WETH',
    },
    tokenOut: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      chainId: 1,
      decimals: 6,
      symbol: 'USDC',
    },
    type: 'v3-pool',
  },
  {
    address: '0x3416cF6C708Da44DB2624D63ea0AAef7113527C6',
    fee: '100',
    liquidity: '174350695210591091',
    sqrtRatioX96: '79215102732984553735141107646',
    tickCurrent: '-4',
    tokenIn: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      chainId: 1,
      decimals: 6,
      symbol: 'USDC',
    },
    tokenOut: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      chainId: 1,
      decimals: 6,
      symbol: 'USDT',
    },
    type: 'v3-pool',
  },
  {
    address: '0xbe3CD9b751360a8030770425AcF947c8cb4CaB38',
    amountOut: '10367908097468',
    fee: '10000',
    liquidity: '5906469014943',
    sqrtRatioX96: '6451784348376798895033490481915',
    tickCurrent: '88000',
    tokenIn: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', chainId: 1, decimals: 6, symbol: 'USDT' },
    tokenOut: {
      address: '0xEd04915c23f00A313a544955524EB7DBD823143d',
      chainId: 1,
      decimals: 8,
      symbol: 'ACH',
    },
    type: 'v3-pool',
  },
]
const validQuoteResult = (isApiResult: boolean) => {
  return {
    amount: '1000000000000000000',
    amountDecimals: '1',
    blockNumber: '15259323',
    gasPriceWei: '15662880037',
    gasUseEstimate: '304000',
    gasUseEstimateQuote: '53578254178',
    gasUseEstimateQuoteDecimals: '535.78254178',
    gasUseEstimateUSD: '7.731162',
    isApiResult,
    quote: '10377254302629',
    quoteDecimals: '103772.54302629',
    quoteGasAdjusted: '10323676048450',
    quoteGasAdjustedDecimals: '103236.7604845',
    quoteId: 'dfa8e',
    route: [v3route],
    routeString: '[V3] 100.00% = WETH -- 0.05% [0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640] --> USDC',
  }
}
const error = new Error('Error')

const expectRouterApiMock = (data?: GetQuoteResult, error?: Error) => {
  if (data) mockGetRouterApiQuote.mockResolvedValue({ data })
  if (error) mockGetRouterApiQuote.mockRejectedValue({ error })
}

const expectClientSideMock = (data?: GetQuoteResult, error?: Error) => {
  if (data) mockGetClientSideQuote.mockResolvedValue({ data })
  if (error) mockGetClientSideQuote.mockRejectedValue({ error })
}

beforeEach(() => {
  // ignore debounced value
  mockUseDebounce.mockImplementation((value) => value)

  mockUseIsWindowVisible.mockReturnValue(true)
  mockIsAutoRouterSupportedChain.mockReturnValue(true)
})

describe('#useRouterTrade ExactIn', () => {
  it('does not compute routing api trade when routing API is not supported', () => {
    mockIsAutoRouterSupportedChain.mockReturnValue(false)
    expectRouterApiMock()
    expectClientSideMock(validQuoteResult(false))

    const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, ROUTER_URL, USDCAmount, DAI))
    expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
  })

  // it('does not compute routing api trade when window is not focused', () => {
  //   mockUseIsWindowVisible.mockReturnValue(false)
  //   expectRouterApiMock(TradeState.NO_ROUTE_FOUND)
  //   expectClientSideMock(TradeState.VALID)

  //   const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, ROUTER_URL, USDCAmount, DAI))
  //   expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
  // })

  // describe('when routing api is in non-error state', () => {
  //   it('does not compute client side v3 trade if routing api is LOADING', () => {
  //     expectRouterApiMock(TradeState.LOADING)
  //     const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, ROUTER_URL, USDCAmount, DAI))
  //     expect(result.current).toEqual({ isApiResult: true, state: TradeState.LOADING, trade: undefined })
  //   })

  //   it('does not compute client side v3 trade if routing api is VALID', () => {
  //     expectRouterApiMock(TradeState.VALID)
  //     const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, ROUTER_URL, USDCAmount, DAI))
  //     expect(result.current).toEqual({ isApiResult: true, state: TradeState.VALID, trade: undefined })
  //   })

  //   it('does not compute client side v3 trade if routing api is SYNCING', () => {
  //     expectRouterApiMock(TradeState.SYNCING)

  //     const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, ROUTER_URL, USDCAmount, DAI))
  //     expect(result.current).toEqual({ isApiResult: true, state: TradeState.SYNCING, trade: undefined })
  //   })
  // })

  // describe('when routing api is in error state', () => {
  //   it('computes client side v3 trade if routing api is INVALID', () => {
  //     expectRouterApiMock(TradeState.INVALID)
  //     expectClientSideMock(TradeState.VALID)

  //     const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, ROUTER_URL, USDCAmount, DAI))
  //     expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
  //   })

  //   it('computes client side v3 trade if routing api is NO_ROUTE_FOUND', () => {
  //     expectRouterApiMock(TradeState.NO_ROUTE_FOUND)
  //     expectClientSideMock(TradeState.VALID)

  //     const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, ROUTER_URL, USDCAmount, DAI))
  //     expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
  //   })
  // })
})

// describe('#useRouterTrade ExactOut', () => {
//   it('does not compute routing api trade when routing API is not supported', () => {
//     mockIsAutoRouterSupportedChain.mockReturnValue(false)
//     expectRouterApiMock(TradeState.INVALID)
//     expectClientSideMock(TradeState.VALID)

//     const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_OUTPUT, ROUTER_URL, DAIAmount, USDC_MAINNET))
//     expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
//   })

//   it('does not compute routing api trade when window is not focused', () => {
//     mockUseIsWindowVisible.mockReturnValue(false)
//     expectRouterApiMock(TradeState.NO_ROUTE_FOUND)
//     expectClientSideMock(TradeState.VALID)

//     const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_OUTPUT, ROUTER_URL, DAIAmount, USDC_MAINNET))
//     expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
//   })
//   describe('when routing api is in non-error state', () => {
//     it('does not compute client side v3 trade if routing api is LOADING', () => {
//       expectRouterApiMock(TradeState.LOADING)

//       const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_OUTPUT, ROUTER_URL, DAIAmount, USDC_MAINNET))
//       expect(result.current).toEqual({ isApiResult: true, state: TradeState.LOADING, trade: undefined })
//     })

//     it('does not compute client side v3 trade if routing api is VALID', () => {
//       expectRouterApiMock(TradeState.VALID)

//       const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_OUTPUT, ROUTER_URL, DAIAmount, USDC_MAINNET))
//       expect(result.current).toEqual({ isApiResult: true, state: TradeState.VALID, trade: undefined })
//     })

//     it('does not compute client side v3 trade if routing api is SYNCING', () => {
//       expectRouterApiMock(TradeState.SYNCING)

//       const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_OUTPUT, ROUTER_URL, DAIAmount, USDC_MAINNET))
//       expect(result.current).toEqual({ isApiResult: true, state: TradeState.SYNCING, trade: undefined })
//     })
//   })

//   describe('when routing api is in error state', () => {
//     it('computes client side v3 trade if routing api is INVALID', () => {
//       expectRouterApiMock(TradeState.INVALID)
//       expectClientSideMock(TradeState.VALID)

//       const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_OUTPUT, ROUTER_URL, DAIAmount, USDC_MAINNET))
//       expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
//     })

//     it('computes client side v3 trade if routing api is NO_ROUTE_FOUND', () => {
//       expectRouterApiMock(TradeState.NO_ROUTE_FOUND)
//       expectClientSideMock(TradeState.VALID)

//       const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_OUTPUT, ROUTER_URL, DAIAmount, USDC_MAINNET))
//       expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
//     })
//   })
// })

// describe('integrator provides bad router URL', () => {
//   it('computes clientside route when routerUrl is undefined', () => {
//     const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, undefined, USDCAmount, DAI))
//     expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
//   })

//   it('computes clientside route when routerUrl is empty', () => {
//     const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, '', USDCAmount, DAI))
//     expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
//   })

//   it('computes clientside route when routerUrl is bad', () => {
//     const { result } = renderHook(() =>
//       useRouterTrade(TradeType.EXACT_INPUT, 'https://broken-url.com', USDCAmount, DAI)
//     )
//     expect(result.current).toEqual({ isApiResult: false, state: TradeState.VALID, trade: undefined })
//   })
// })
