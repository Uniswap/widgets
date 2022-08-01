import { renderHook } from '@testing-library/react-hooks'
import { CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { DAI, USDC_MAINNET } from 'constants/tokens'
import { GetQuoteResult, TradeState } from 'state/routing/types'

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

const validQuoteResult: GetQuoteResult = {
  amount: '100000000000',
  amountDecimals: '100000',
  blockNumber: '15220677',
  gasPriceWei: '37477510620',
  gasUseEstimate: '386000',
  gasUseEstimateQuote: '214490841408308181',
  gasUseEstimateQuoteDecimals: '0.214490841408308181',
  gasUseEstimateUSD: '19.998844',
  isApiResult: true,
  methodParameters: undefined,
  quote: '1294204987760689604911',
  quoteDecimals: '1294.204987760689604911',
  quoteGasAdjusted: '1294419478602097913092',
  quoteGasAdjustedDecimals: '1294.419478602097913092',
  route: [],
  routeString: '',
}
const error = new Error('Error')

const expectRouterApiMock = (error?: Error) => {
  // mockUseRouterTrade.mockReturnValue({ isApiResult: true, state: TradeState.VALID, trade: undefined })
  mockGetRouterApiQuote.mockResolvedValue({ data: validQuoteResult })
  mockGetRouterApiQuote.mockRejectedValue({ error })
}

const expectClientSideMock = (error?: Error) => {
  mockGetClientSideQuote.mockResolvedValue({ data: validQuoteResult })
  mockGetClientSideQuote.mockRejectedValue({ error })
  // mockUseRouterTrade.mockReturnValue({ isApiResult: false, state, trade: undefined })
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
    expectClientSideMock()

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
