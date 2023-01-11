import { TradeType } from '@uniswap/sdk-core'
import assert from 'assert'
import { DAI, USDC_MAINNET } from 'constants/tokens'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import * as usePermit2Allowance from 'hooks/usePermit2Allowance'
import { flagsAtom } from 'hooks/useSyncFlags'
import Module from 'module'
import { Field, stateAtom, Swap } from 'state/swap'
import { act, queryByText, renderComponent } from 'test'

import Toolbar from './index'

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
      isApprovalLoading: false,
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
    [Field.OUTPUT]: USDC_MAINNET,
    ...trade,
  }
}

describe('Toolbar', () => {
  it('should not render without currencies specified', () => {
    const component = renderComponent(<Toolbar />)
    expect(component.queryByTestId('toolbar')).toBeNull()
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
    expect(component.queryByText('Enter an amount')).toBeTruthy()
  })

  it('should render a request for approval', async () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Toolbar />
      </SwapInfoProvider>,
      {
        initialAtomValues: [
          [stateAtom, getInitialTradeState({ amount: '1' })],
          [flagsAtom, { permit2: true }],
        ],
      }
    )
    const action = component.queryByTestId('action-button')
    assert(action)
    expect(queryByText(action, 'Approve token')).toBeTruthy()

    const approveAndPermit = (usePermit2Allowance as unknown as { approveAndPermit: () => void }).approveAndPermit
    await act(() => action.querySelector('button')?.click())
    expect(approveAndPermit).toHaveBeenCalled()
  })
})
