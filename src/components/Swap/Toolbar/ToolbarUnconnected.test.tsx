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
    chainId: 1,
    account: null,
  }),
}))

describe('ToolbarUnconnected', () => {
  it('should not render Toolbar caption when wallet is not connected', () => {
    const component = renderComponent(<Toolbar />)
    expect(component.queryByTestId('toolbar')).toBeNull()
    expect(component.getByText('Connect wallet')).toBeTruthy()
  })
})
