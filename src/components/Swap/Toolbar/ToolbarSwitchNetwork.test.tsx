import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import Module from 'module'
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

jest.mock('@web3-react/core', () => ({
  ...(jest.requireActual('@web3-react/core') as Module),
  useWeb3React: () => ({
    isActive: true,
    chainId: 137,
    account: '0x0000000000000000000000000000000000000000',
  }),
}))

describe('ToolbarSwitchNetwork', () => {
  it('should render correct values on an incorrect chain Id', () => {
    const component = renderComponent(
      <SwapInfoProvider>
        <Toolbar />
      </SwapInfoProvider>
    )
    expect(component.queryByTestId('toolbar')).toBeNull()
    expect(component.getByText('Connect to Ethereum')).toBeTruthy() // should be enabled
  })
})
