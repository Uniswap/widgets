/**
 * @jest-environment hardhat/dist/jsdom
 */

import { JsonRpcProvider } from '@ethersproject/providers'
import 'jest-environment-hardhat'

import { renderHook, WrapperComponent } from '@testing-library/react-hooks'
import { CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { DAI, USDC_MAINNET } from 'constants/tokens'
import { GetQuoteResult, TradeState, V3PoolInRoute } from 'state/routing/types'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from 'state'
import useActiveWeb3React, { ActiveWeb3Provider } from 'hooks/useActiveWeb3React'
import { BlockNumberProvider } from 'hooks/useBlockNumber'

import { getClientSideQuote, isAutoRouterSupportedChain } from './clientSideSmartOrderRouter'
import { useRouterTrade } from './useRouterTrade'
import { getRouterApiQuote, QuoteArguments } from 'state/routing/slice'

import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { Trade } from 'components/Swap/Toolbar/Caption'
import { AlphaRouterConfig } from '@uniswap/smart-order-router'
import { EIP1193 } from '@web3-react/eip1193'
import { initializeConnector } from '@web3-react/core'
import JsonRpcConnector from 'utils/JsonRpcConnector'
import { waitFor } from '@testing-library/react'

const ROUTER_URL = 'https://api.uniswap.org/v1/'

const USDCAmount = CurrencyAmount.fromRawAmount(USDC_MAINNET, '1')
const DAIAmount = CurrencyAmount.fromRawAmount(DAI, '1')

jest.mock('./clientSideSmartOrderRouter')
jest.mock('hooks/useDebounce')
jest.mock('hooks/useIsWindowVisible')
// jest.mock('state/')
jest.mock('hooks/useActiveWeb3React')

const mockUseDebounce = useDebounce as jest.MockedFunction<typeof useDebounce>
const mockIsAutoRouterSupportedChain = isAutoRouterSupportedChain as jest.MockedFunction<
  typeof isAutoRouterSupportedChain
>
const mockUseIsWindowVisible = useIsWindowVisible as jest.MockedFunction<typeof useIsWindowVisible>
const mockUseActiveWeb3React = useActiveWeb3React as jest.MockedFunction<typeof useActiveWeb3React>

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
    address: '0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168',
    amountIn: '1000000',
    amountOut: '999864608834353719',
    fee: '100',
    liquidity: '4860835302628184189362918',
    sqrtRatioX96: '79229564680073347405847',
    tickCurrent: '-276324',
    tokenIn: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      chainId: 1,
      decimals: 6,
      symbol: 'USDC',
    },
    tokenOut: {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      chainId: 1,
      decimals: 18,
      symbol: 'DAI',
    },
    type: 'v3-pool',
  },
]
const validQuoteResult = (isApiResult: boolean) => {
  return {
    amount: '1000000',
    amountDecimals: '1',
    blockNumber: '15265125',
    gasPriceWei: '27119565267',
    gasUseEstimate: '113000',
    gasUseEstimateQuote: '5032683228533210957',
    gasUseEstimateQuoteDecimals: '5.032683228533210957',
    gasUseEstimateUSD: '5.026105',
    isApiResult,
    quote: '999864608834353719',
    quoteDecimals: '0.999864608834353719',
    quoteGasAdjusted: '-4032818619698857238',
    quoteGasAdjustedDecimals: '-4.032818619698857238',
    quoteId: 'eb0ed',
    route: [v3route],
    routeString: '[V3] 100.00% = USDC -- 0.01% [0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168] --> DAI',
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

const [connector] = initializeConnector((actions) => new JsonRpcConnector(actions, hardhat.provider))
mockUseActiveWeb3React.mockReturnValue({
  chainId: 1,
  library: hardhat.provider,
  connector,
})

const wrapper = ({ children }) => (
  <ReduxProvider store={store}>
    <BlockNumberProvider>{children}</BlockNumberProvider>
  </ReduxProvider>
)

beforeEach(() => {
  // ignore debounced value
  mockUseDebounce.mockImplementation((value) => value)

  mockUseIsWindowVisible.mockReturnValue(true)
  mockIsAutoRouterSupportedChain.mockReturnValue(true)
})

describe('integrator provides bad router URL', () => {
  it('computes clientside route trade when routerUrl not provided', async () => {
    expectRouterApiMock()
    expectClientSideMock(validQuoteResult(false))

    const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, undefined, USDCAmount, DAI), { wrapper })

    await waitFor(() => expect(result.current.state).not.toBe(TradeState.LOADING))

    expect(result.current.trade).toBeDefined()
    expect(result.current.isApiResult).toBeFalsy()
    expect(result.current.state).toEqual(TradeState.VALID)
  })

  it('computes clientside route trade when routerUrl is empty', async () => {
    expectRouterApiMock()
    expectClientSideMock(validQuoteResult(false))

    const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, '', USDCAmount, DAI), { wrapper })

    await waitFor(() => expect(result.current.state).not.toBe(TradeState.LOADING))

    expect(result.current.trade).toBeDefined()
    expect(result.current.isApiResult).toBeFalsy()
    expect(result.current.state).toEqual(TradeState.VALID)
  })

  it('computes clientside route trade when routerUrl is bad', async () => {
    expectRouterApiMock(undefined, error)
    expectClientSideMock(validQuoteResult(false))

    const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, 'google.com', USDCAmount, DAI), {
      wrapper,
    })

    await waitFor(() => expect(result.current.state).not.toBe(TradeState.LOADING))

    expect(result.current.trade).toBeDefined()
    expect(result.current.isApiResult).toBeFalsy()
    expect(result.current.state).toEqual(TradeState.VALID)
  })
})

describe('routing API not used', () => {
  it('computes client side v3 trade if routing api errors', async () => {
    expectRouterApiMock(error)
    expectClientSideMock(validQuoteResult(false))

    const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, ROUTER_URL, USDCAmount, DAI), {
      wrapper,
    })

    await waitFor(() => expect(result.current.state).not.toBe(TradeState.LOADING))

    expect(result.current.trade).toBeDefined()
    expect(result.current.isApiResult).toBeFalsy()
    expect(result.current.state).toEqual(TradeState.VALID)
  })

  // it('does not compute routing api trade when window is not focused', async () => {
  //   mockUseIsWindowVisible.mockReturnValue(false)
  //   expectRouterApiMock()
  //   expectClientSideMock(validQuoteResult(false))

  //   const { result } = renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, ROUTER_URL, USDCAmount, DAI), { wrapper })
  //   console.log('WINDOW NOT FOCUSED', result.current)
  //   await waitFor(() => expect(result.current.state).not.toBe(TradeState.LOADING))

  //   expect(result.current.trade).toBeDefined()
  //   expect(result.current.isApiResult).toBeFalsy()
  //   expect(result.current.state).toEqual(TradeState.VALID)
  // })

  // it('does not compute routing api trade when routing API is not supported', () => {
  //   mockIsAutoRouterSupportedChain.mockReturnValue(false)
  //   expectRouterApiMock()
  //   expectClientSideMock(validQuoteResult(false))

  //   const wrapper:
  //     | WrapperComponent<{
  //         provider: JsonRpcProvider
  //         jsonRpcEndpoint: string
  //       }>
  //     | undefined = ({ children, provider, jsonRpcEndpoint }) => (
  //     <ActiveWeb3Provider provider={provider} jsonRpcEndpoint={jsonRpcEndpoint}>
  //       {children}
  //     </ActiveWeb3Provider>
  //   )

  //   expect(
  //     renderHook(() => useRouterTrade(TradeType.EXACT_INPUT, ROUTER_URL, USDCAmount, DAI), {
  //       wrapper,
  //       initialProps: { provider: hardhat.provider, jsonRpcEndpoint: hardhat.url },
  //     })
  //   ).toThrow()
  // })
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
// })

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
