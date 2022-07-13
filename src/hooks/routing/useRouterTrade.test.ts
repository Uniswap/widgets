import { renderHook } from '@testing-library/react-hooks'
import { CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { DAI, USDC_MAINNET } from 'constants/tokens'
import { TradeState } from 'state/routing/types'

import { isAutoRouterSupportedChain } from './clientSideSmartOrderRouter'
import { useRouterTrade } from './useRouterTrade'
import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'

const USDCAmount = CurrencyAmount.fromRawAmount(USDC_MAINNET, '10000')
const DAIAmount = CurrencyAmount.fromRawAmount(DAI, '10000')

jest.mock('./clientSideSmartOrderRouter')
jest.mock('./useRouterTrade')
jest.mock('hooks/useDebounce')
jest.mock('hooks/useIsWindowVisible')
jest.mock('state/user/hooks')

const mockUseDebounce = useDebounce as jest.MockedFunction<typeof useDebounce>
const mockIsAutoRouterSupportedChain = isAutoRouterSupportedChain as jest.MockedFunction<
  typeof isAutoRouterSupportedChain
>
const mockUseIsWindowVisible = useIsWindowVisible as jest.MockedFunction<typeof useIsWindowVisible>

const mockUseRouterTrade = useRouterTrade as jest.MockedFunction<typeof useRouterTrade>

// helpers to set mock expectations
const expectRouterMock = (state: TradeState) => {
  mockUseRouterTrade.mockReturnValue({ state, trade: undefined })
}

beforeEach(() => {
  // ignore debounced value
  mockUseDebounce.mockImplementation((value) => value)

  mockUseIsWindowVisible.mockReturnValue(true)
  mockIsAutoRouterSupportedChain.mockReturnValue(true)
})

describe('#useRouterTrade ExactIn', () => {
  // mock isAutoRouterSupportedChain = false
  // does not use routingAPI trade
  it('does not compute routing api trade when routing API is not supported', () => {
    mockIsAutoRouterSupportedChain.mockReturnValue(false)
    expectRouterMock(TradeState.INVALID)
    expectClientSideMock(TradeState.VALID)

    const { result } = renderHook(() => useBestTrade(TradeType.EXACT_INPUT, USDCAmount, DAI))

    expect(mockUseRouterTrade).toHaveBeenCalledWith(TradeType.EXACT_INPUT, undefined, DAI)
    expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_INPUT, USDCAmount, DAI)
    expect(result.current).toEqual({ state: TradeState.VALID, trade: undefined })
  })

  it('does not compute routing api trade when window is not focused', () => {
    mockUseIsWindowVisible.mockReturnValue(false)
    expectRouterMock(TradeState.NO_ROUTE_FOUND)
    expectClientSideMock(TradeState.VALID)

    const { result } = renderHook(() => useBestTrade(TradeType.EXACT_INPUT, USDCAmount, DAI))

    expect(mockUseRouterTrade).toHaveBeenCalledWith(TradeType.EXACT_INPUT, undefined, DAI)
    expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_INPUT, USDCAmount, DAI)
    expect(result.current).toEqual({ state: TradeState.VALID, trade: undefined })
  })

  describe('when routing api is in non-error state', () => {
    it('does not compute client side v3 trade if routing api is LOADING', () => {
      expectRouterMock(TradeState.LOADING)

      const { result } = renderHook(() => useBestTrade(TradeType.EXACT_INPUT, USDCAmount, DAI))

      expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_INPUT, undefined, undefined)
      expect(result.current).toEqual({ state: TradeState.LOADING, trade: undefined })
    })

    it('does not compute client side v3 trade if routing api is VALID', () => {
      expectRouterMock(TradeState.VALID)

      const { result } = renderHook(() => useBestTrade(TradeType.EXACT_INPUT, USDCAmount, DAI))

      expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_INPUT, undefined, undefined)
      expect(result.current).toEqual({ state: TradeState.VALID, trade: undefined })
    })

    it('does not compute client side v3 trade if routing api is SYNCING', () => {
      expectRouterMock(TradeState.SYNCING)

      const { result } = renderHook(() => useBestTrade(TradeType.EXACT_INPUT, USDCAmount, DAI))

      expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_INPUT, undefined, undefined)
      expect(result.current).toEqual({ state: TradeState.SYNCING, trade: undefined })
    })
  })

  describe('when routing api is in error state', () => {
    it('does not compute client side v3 trade if routing api is INVALID', () => {
      expectRouterMock(TradeState.INVALID)
      expectClientSideMock(TradeState.VALID)

      renderHook(() => useBestTrade(TradeType.EXACT_INPUT, USDCAmount, DAI))

      expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_INPUT, undefined, undefined)
    })

    it('computes client side v3 trade if routing api is NO_ROUTE_FOUND', () => {
      expectRouterMock(TradeState.NO_ROUTE_FOUND)
      expectClientSideMock(TradeState.VALID)

      const { result } = renderHook(() => useBestTrade(TradeType.EXACT_INPUT, USDCAmount, DAI))

      expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_INPUT, USDCAmount, DAI)
      expect(result.current).toEqual({ state: TradeState.VALID, trade: undefined })
    })
  })
})

describe('#useRouterTrade ExactOut', () => {
  it('does not compute routing api trade when routing API is not supported', () => {
    mockIsAutoRouterSupportedChain.mockReturnValue(false)
    expectRouterMock(TradeState.INVALID)
    expectClientSideMock(TradeState.VALID)

    const { result } = renderHook(() => useBestTrade(TradeType.EXACT_OUTPUT, DAIAmount, USDC_MAINNET))

    expect(mockUseRouterTrade).toHaveBeenCalledWith(TradeType.EXACT_OUTPUT, undefined, USDC_MAINNET)
    expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_OUTPUT, DAIAmount, USDC_MAINNET)
    expect(result.current).toEqual({ state: TradeState.VALID, trade: undefined })
  })

  it('does not compute routing api trade when window is not focused', () => {
    mockUseIsWindowVisible.mockReturnValue(false)
    expectRouterMock(TradeState.NO_ROUTE_FOUND)
    expectClientSideMock(TradeState.VALID)

    const { result } = renderHook(() => useBestTrade(TradeType.EXACT_OUTPUT, DAIAmount, USDC_MAINNET))

    expect(mockUseRouterTrade).toHaveBeenCalledWith(TradeType.EXACT_OUTPUT, undefined, USDC_MAINNET)
    expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_OUTPUT, DAIAmount, USDC_MAINNET)
    expect(result.current).toEqual({ state: TradeState.VALID, trade: undefined })
  })
  describe('when routing api is in non-error state', () => {
    it('does not compute client side v3 trade if routing api is LOADING', () => {
      expectRouterMock(TradeState.LOADING)

      const { result } = renderHook(() => useBestTrade(TradeType.EXACT_OUTPUT, DAIAmount, USDC_MAINNET))

      expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_OUTPUT, undefined, undefined)
      expect(result.current).toEqual({ state: TradeState.LOADING, trade: undefined })
    })

    it('does not compute client side v3 trade if routing api is VALID', () => {
      expectRouterMock(TradeState.VALID)

      const { result } = renderHook(() => useBestTrade(TradeType.EXACT_OUTPUT, DAIAmount, USDC_MAINNET))

      expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_OUTPUT, undefined, undefined)
      expect(result.current).toEqual({ state: TradeState.VALID, trade: undefined })
    })

    it('does not compute client side v3 trade if routing api is SYNCING', () => {
      expectRouterMock(TradeState.SYNCING)

      const { result } = renderHook(() => useBestTrade(TradeType.EXACT_OUTPUT, DAIAmount, USDC_MAINNET))

      expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_OUTPUT, undefined, undefined)
      expect(result.current).toEqual({ state: TradeState.SYNCING, trade: undefined })
    })
  })

  describe('when routing api is in error state', () => {
    it('computes client side v3 trade if routing api is INVALID', () => {
      expectRouterMock(TradeState.INVALID)
      expectClientSideMock(TradeState.VALID)

      renderHook(() => useBestTrade(TradeType.EXACT_OUTPUT, DAIAmount, USDC_MAINNET))

      expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_OUTPUT, undefined, undefined)
    })

    it('computes client side v3 trade if routing api is NO_ROUTE_FOUND', () => {
      expectRouterMock(TradeState.NO_ROUTE_FOUND)
      expectClientSideMock(TradeState.VALID)

      const { result } = renderHook(() => useBestTrade(TradeType.EXACT_OUTPUT, DAIAmount, USDC_MAINNET))

      expect(mockUseClientSideV3Trade).toHaveBeenCalledWith(TradeType.EXACT_OUTPUT, DAIAmount, USDC_MAINNET)
      expect(result.current).toEqual({ state: TradeState.VALID, trade: undefined })
    })
  })
})
