import { SupportedChainId, TradeType } from '@uniswap/sdk-core'
import { DAI, ExtendedEther, USDC_MAINNET, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import Module from 'module'
import { Field, stateAtom, Swap } from 'state/swap'
import { renderComponent } from 'test'

import Toolbar from './index'

jest.mock('hooks/usePermit2Allowance', () => {
  const approveAndPermit = jest.fn().mockResolvedValue(undefined)
  return {
    __esModule: true,
    ...(jest.requireActual('hooks/usePermit2Allowance') as Module),
    default: () => ({
      state: jest.requireActual('hooks/usePermit2Allowance').AllowanceState.REQUIRED,
      isApprovalLoading: false,
      approveAndPermit,
    }),
    approveAndPermit, // return a referentially stable mock for testing
  }
})

export function getInitialTradeState(trade: Partial<Swap> = {}) {
  return {
    type: TradeType.EXACT_INPUT,
    amount: '',
    [Field.INPUT]: DAI,
    [Field.OUTPUT]: USDC_MAINNET,
    ...trade,
  }
}

jest.mock('@web3-react/core', () => ({
  ...(jest.requireActual('@web3-react/core') as Module),
  useWeb3React: () => ({
    isActive: true,
    chainId: 1,
    account: '0x0000000000000000000000000000000000000000',
  }),
}))

describe('Toolbar', () => {
  it('should show review swap button with one currency specified, no amount input', () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Toolbar />
      </SwapInfoProvider>,
      {
        initialAtomValues: [
          [
            stateAtom,
            getInitialTradeState({
              [Field.OUTPUT]: undefined,
            }),
          ],
        ],
      }
    )
    expect(component.queryByTestId('toolbar')).toBeNull()
    expect(component.queryByText('Select token')).toBeTruthy() // should be disabled
  })

  it('should render with both currencies specified, no amount input', () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Toolbar />
      </SwapInfoProvider>,
      {
        initialAtomValues: [[stateAtom, getInitialTradeState()]],
      }
    )
    expect(component.queryByTestId('toolbar')).toBeTruthy()
    expect(component.queryByText('Enter an amount')).toBeTruthy()
    expect(component.queryByText('Review swap')).toBeTruthy() // should be disabled
  })

  // todo: test the loading state by mocking the router API
  xit('should render with both currencies specified, amount input, trade loading', () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Toolbar />
      </SwapInfoProvider>,
      {
        initialAtomValues: [[stateAtom, getInitialTradeState({ amount: '1' })]],
      }
    )
    expect(component.queryByTestId('toolbar')).toBeTruthy()
    expect(component.getByText('Fetching best price')).toBeTruthy()
    expect(component.queryByText('Review swap')).toBeTruthy() // should be disabled
  })

  // todo: test the loaded trade state by mocking the router API
  xit('should render with both currencies specified, amount input, trade loaded', () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Toolbar />
      </SwapInfoProvider>,
      {
        initialAtomValues: [[stateAtom, getInitialTradeState({ amount: '1' })]],
      }
    )
    expect(component.queryByTestId('toolbar')).toBeTruthy()
    expect(component.getByText('1 DAI = ')).toBeTruthy() // todo: mock the exchange rate
    expect(component.queryByText('Review swap')).toBeTruthy() // should be enabled
  })

  // todo: test the liquidity warning state by mocking the router API and using long tail tokens
  xit('should render with both currencies specified, amount input, trade loaded, liquidity warning', () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Toolbar />
      </SwapInfoProvider>,
      {
        initialAtomValues: [[stateAtom, getInitialTradeState({ amount: '1' })]],
      }
    )
    expect(component.queryByTestId('toolbar')).toBeTruthy()
    expect(component.getByText('1 DAI = ')).toBeTruthy() // todo: mock the exchange rate
    expect(component.queryByText('Insufficient liquidity')).toBeTruthy() // should be disabled
  })

  // todo: test the loaded trade state by mocking the router API, for a token with no balance
  xit('should render with both currencies specified, amount input, trade loaded, no balance', () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Toolbar />
      </SwapInfoProvider>,
      {
        initialAtomValues: [[stateAtom, getInitialTradeState({ amount: '1' })]],
      }
    )
    expect(component.queryByTestId('toolbar')).toBeTruthy()
    expect(component.getByText('1 DAI = ')).toBeTruthy() // todo: mock the exchange rate
    expect(component.queryByText('Insufficient ETH balance')).toBeTruthy() // should be disabled
  })

  it('should render correct values for a wrap transaction', () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Toolbar />
      </SwapInfoProvider>,
      {
        initialAtomValues: [
          [
            stateAtom,
            getInitialTradeState({
              amount: '1',
              [Field.INPUT]: ExtendedEther.onChain(SupportedChainId.MAINNET),
              [Field.OUTPUT]: WRAPPED_NATIVE_CURRENCY[SupportedChainId.MAINNET],
            }),
          ],
        ],
      }
    )
    expect(component.queryByTestId('toolbar')).toBeTruthy()
    expect(component.getByText('Convert ETH to WETH')).toBeTruthy()
    expect(component.queryByText('Wrap ETH')).toBeTruthy() // should be enabled
  })
})
