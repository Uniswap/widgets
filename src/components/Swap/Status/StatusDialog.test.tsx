import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { InterfaceTrade } from 'state/routing/types'
import { Transaction, TransactionType } from 'state/transactions'
import { renderComponent } from 'test'
import { buildMultiV3Route, buildSingleV3Route, DAI, USDC } from 'test/utils'

import TransactionStatusDialog from './StatusDialog'

const usdc = CurrencyAmount.fromRawAmount(USDC, 1)
const dai = CurrencyAmount.fromRawAmount(DAI, 1)

const buildTestTx = (status?: number): Transaction => ({
  addedTime: 0,
  receipt: {
    status,
    confirmations: 0,
    from: '0x123',
    to: '0x123',
    contractAddress: '0x123',
    gasUsed: BigNumber.from('0x123'),
    logsBloom: '0x123',
    transactionIndex: 0,
    blockHash: '0x123',
    transactionHash: '0x123',
    logs: [],
    blockNumber: 0,
    cumulativeGasUsed: BigNumber.from('0x123'),
    byzantium: true,
    effectiveGasPrice: BigNumber.from('0x123'),
    type: 0,
  },
  info: {
    type: TransactionType.SWAP,
    tradeType: TradeType.EXACT_INPUT,
    response: {
      hash: '0x123',
      confirmations: 0,
      from: '0x123',
      to: '0x123',
      gasLimit: BigNumber.from('0x123'),
      wait: jest.fn(),
      nonce: 0,
      data: '0x123',
      value: BigNumber.from('0x123'),
      chainId: 1,
    },
    trade: new InterfaceTrade({
      v2Routes: [],
      v3Routes: [buildMultiV3Route(usdc, dai), buildSingleV3Route(usdc, dai)],
      tradeType: TradeType.EXACT_INPUT,
    }),
    slippageTolerance: new Percent(1, 100),
  },
})

describe('StatusDialog', () => {
  it('should render an error dialog', () => {
    const testTx: Transaction = buildTestTx(0)
    const component = renderComponent(<TransactionStatusDialog tx={testTx} onClose={jest.fn()} />)
    expect(component.queryByTestId('status-dialog')).toBeNull()
    expect(component.queryByText('Your swap failed.')).not.toBeNull()
  })

  it('should render a success dialog', () => {
    const testTx: Transaction = buildTestTx(1)

    const component = renderComponent(<TransactionStatusDialog tx={testTx} onClose={jest.fn()} />)
    expect(component.queryByText('Your swap failed.')).toBeNull()
    expect(component.queryByText('Success')).not.toBeNull()
  })

  it('should render a pending dialog', () => {
    const testTx: Transaction = buildTestTx(undefined)
    const component = renderComponent(<TransactionStatusDialog tx={testTx} onClose={jest.fn()} />)
    expect(component.queryByText('Your swap failed.')).toBeNull()
    expect(component.queryByText('Success')).toBeNull()
    expect(component.queryByText('Transaction submitted')).not.toBeNull()
  })
})
