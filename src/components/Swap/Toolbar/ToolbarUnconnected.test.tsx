import { TradeType } from '@uniswap/sdk-core'
import { DAI, USDC_MAINNET } from 'constants/tokens'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import Module from 'module'
import { Field, stateAtom } from 'state/swap'
import { renderComponent } from 'test'

import Toolbar from './index'
// import { getInitialTradeState } from './Toolbar.test'

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

jest.mock('@web3-react/core', () => ({
  ...(jest.requireActual('@web3-react/core') as Module),
  useWeb3React: () => ({
    isActive: true,
    chainId: 1,
    account: null,
  }),
}))

describe('ToolbarUnconnected', () => {
  it('should not render Toolbar caption when wallet is not connected and there is no input', () => {
    const component = renderComponent(<Toolbar />)
    expect(component.queryByTestId('toolbar')).toBeNull()
    expect(component.getByText('Connect wallet')).toBeTruthy()
  })

  it('should render Toolbar caption when wallet is not connected and there is input', () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Toolbar />
      </SwapInfoProvider>,
      {
        initialAtomValues: [
          [
            stateAtom,
            {
              type: TradeType.EXACT_INPUT,
              [Field.INPUT]: DAI,
              [Field.OUTPUT]: USDC_MAINNET,
              amount: '1',
            },
          ],
        ],
      }
    )
    expect(component.queryByTestId('toolbar')).toBeTruthy()
    expect(component.getByText('Connect wallet')).toBeTruthy()
  })
})
