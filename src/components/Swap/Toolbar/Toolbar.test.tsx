import { TradeType } from '@uniswap/sdk-core'
import { DAI, USDC_MAINNET } from 'constants/tokens'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import Module from 'module'
import { Field, stateAtom, Swap } from 'state/swap'
import { renderComponent } from 'test'

import Toolbar from './index'

jest.mock('@web3-react/core', () => ({
  ...(jest.requireActual('@web3-react/core') as Module),
  useWeb3React: () => ({
    isActive: true,
    chainId: 1,
    account: '0x0000000000000000000000000000000000000000',
  }),
}))

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
})
