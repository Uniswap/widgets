import { SupportedChainId } from '@uniswap/sdk-core'
import { BASES_TO_CHECK_TRADES_AGAINST } from 'constants/routing'
import { renderComponent } from 'test'

import CommonBases from './CommonBases'

describe('CommonBases', () => {
  const itRendersCorrectCurrenciesForChainId = (chainId: SupportedChainId) => {
    const component = renderComponent(<CommonBases chainId={chainId} onSelect={jest.fn()} />)
    const tokens = BASES_TO_CHECK_TRADES_AGAINST[chainId]
    tokens.forEach((token) => {
      expect(component.getAllByText(token.symbol as string)).toBeTruthy()
    })
  }

  it('calls the select function', () => {
    const callback = jest.fn()
    const component = renderComponent(<CommonBases chainId={SupportedChainId.MAINNET} onSelect={callback} />)
    component.getByText('USDC').click()
    expect(callback).toHaveBeenCalled()
  })

  it('renders correct currencies, mainnet', () => {
    itRendersCorrectCurrenciesForChainId(SupportedChainId.MAINNET)
  })

  it('renders correct currencies, optimism', () => {
    itRendersCorrectCurrenciesForChainId(SupportedChainId.OPTIMISM)
  })

  it('renders correct currencies, arbitrum', () => {
    itRendersCorrectCurrenciesForChainId(SupportedChainId.ARBITRUM_ONE)
  })

  it('renders correct currencies, polygon', () => {
    itRendersCorrectCurrenciesForChainId(SupportedChainId.POLYGON)
  })

  it('renders correct currencies, celo', () => {
    itRendersCorrectCurrenciesForChainId(SupportedChainId.CELO)
  })
})
