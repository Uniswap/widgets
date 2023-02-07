import { CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import assert from 'assert'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import * as usePermit2Allowance from 'hooks/usePermit2Allowance'
import { flagsAtom } from 'hooks/useSyncFlags'
import Module from 'module'
import { InterfaceTrade } from 'state/routing/types'
import { Field, stateAtom, Swap } from 'state/swap'
import { act, queryByText, renderComponent } from 'test'
import { buildMultiV3Route, buildSingleV3Route, DAI, USDC } from 'test/utils'

import { ConfirmButton } from './index'

const usdc = CurrencyAmount.fromRawAmount(USDC, 1)
const dai = CurrencyAmount.fromRawAmount(DAI, 1)

jest.mock('@web3-react/core', () => ({
  ...(jest.requireActual('@web3-react/core') as Module),
  useWeb3React: () => ({
    isActive: true,
    chainId: 1,
    account: '0x0000000000000000000000000000000000000000',
  }),
}))

jest.mock('hooks/usePermit2Allowance', () => {
  const approveAndPermit = jest.fn().mockResolvedValue(undefined)
  return {
    __esModule: true,
    ...(jest.requireActual('hooks/usePermit2Allowance') as Module),
    default: () => ({
      state: jest.requireActual('hooks/usePermit2Allowance').AllowanceState.REQUIRED,
      isApproved: false,
      approveAndPermit,
    }),
    approveAndPermit, // return a referentially stable mock for testing
  }
})

function getInitialTradeState(trade: Partial<Swap> = {}) {
  return {
    type: TradeType.EXACT_INPUT,
    amount: '',
    [Field.INPUT]: DAI,
    [Field.OUTPUT]: USDC,
    ...trade,
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const EMPTY_ASYNC_FUCTION = async () => {}
const EMPTY_PROMISE_FUNCTION = async () => {
  return new Promise<void>(EMPTY_ASYNC_FUCTION)
}
function Summary({ allowance }: { allowance: usePermit2Allowance.Allowance }) {
  return (
    <ConfirmButton
      trade={
        new InterfaceTrade({
          v2Routes: [],
          v3Routes: [buildMultiV3Route(usdc, dai), buildSingleV3Route(usdc, dai)],
          tradeType: TradeType.EXACT_INPUT,
        })
      }
      onConfirm={EMPTY_PROMISE_FUNCTION}
      onAcknowledgeNewTrade={EMPTY_ASYNC_FUCTION}
      allowance={allowance}
    />
  )
}

describe('ConfirmButton', () => {
  it('should render a swap pending message', async () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Summary
          allowance={{
            state: usePermit2Allowance.AllowanceState.ALLOWED,
          }}
        />
      </SwapInfoProvider>,
      {
        initialAtomValues: [
          [stateAtom, getInitialTradeState({ amount: '1' })],
          [flagsAtom, { permit2: true }],
        ],
      }
    )
    const button = component.queryByTestId('swap-button')
    assert(button)
    expect(component.queryByText('Swap')).toBeTruthy()
    await act(() => button?.click())
    const button2 = component.queryByTestId('action-button')
    assert(button2)
    expect(component.queryByText('Confirm in your wallet')).toBeTruthy()
  })

  it('should render a request for approval', async () => {
    const approveAndPermit = (usePermit2Allowance as unknown as { approveAndPermit: () => Promise<void> })
      .approveAndPermit
    const component = renderComponent(
      <SwapInfoProvider>
        <Summary
          allowance={{
            token: USDC,
            state: usePermit2Allowance.AllowanceState.REQUIRED,
            isApprovalLoading: true,
            isApproved: false,
            approveAndPermit,
          }}
        />
      </SwapInfoProvider>,
      {
        initialAtomValues: [
          [stateAtom, getInitialTradeState({ amount: '1' })],
          [flagsAtom, { permit2: true }],
        ],
      }
    )
    const button = component.queryByTestId('swap-button')
    assert(button)
    expect(component.queryByText('Swap')).toBeTruthy()
    await act(() => button?.click())
    const button2 = component.queryByTestId('action-button')
    assert(button2)
    expect(queryByText(button2, 'Approve permit')).toBeTruthy()
    expect(approveAndPermit).toHaveBeenCalled()
  })

  it('should render a request for approval', async () => {
    const approveAndPermit = (usePermit2Allowance as unknown as { approveAndPermit: () => Promise<void> })
      .approveAndPermit
    const component = renderComponent(
      <SwapInfoProvider>
        <Summary
          allowance={{
            token: USDC,
            state: usePermit2Allowance.AllowanceState.REQUIRED,
            isApprovalLoading: true,
            isApproved: true,
            approveAndPermit,
          }}
        />
      </SwapInfoProvider>,
      {
        initialAtomValues: [
          [stateAtom, getInitialTradeState({ amount: '1' })],
          [flagsAtom, { permit2: true }],
        ],
      }
    )
    const button = component.queryByTestId('swap-button')
    await act(() => button?.click())
    const button2 = component.queryByTestId('action-button')
    assert(button2)
    expect(queryByText(button2, 'Approve token for trading')).toBeTruthy()
    expect(approveAndPermit).toHaveBeenCalled()
  })
})
